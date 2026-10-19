-- ====================================================================
-- QUESTIFY PRODUCTION MIGRATION: TEAM BATTLES CHALLENGES & QUIZ STATUS
-- ====================================================================

-- 1. BATTLE CHALLENGES EXPANSION & SUBMISSION TRACKING
-- Ensures battles have rich challenge definitions (quiz and coding) and tracks student submissions.

create table if not exists public.battle_challenge_submissions (
  id uuid default gen_random_uuid() primary key,
  battle_id uuid references public.battles(id) on delete cascade not null,
  challenge_id uuid references public.battle_challenges(id) on delete cascade not null,
  team_id uuid references public.battle_teams(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  challenge_type text not null check (challenge_type in ('quiz', 'coding')),
  answers jsonb,
  code text,
  language text default 'javascript',
  is_correct boolean not null default false,
  score integer not null default 0,
  xp_awarded integer not null default 0,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_battle_challenge unique (battle_id, challenge_id, user_id)
);

alter table public.battle_challenge_submissions enable row level security;

create policy "Users can view challenge submissions for their battles"
  on public.battle_challenge_submissions for select
  using (
    exists (
      select 1 from public.battle_team_members btm
      where btm.team_id = battle_challenge_submissions.team_id
        and btm.user_id = auth.uid()
    ) or exists (
      select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

-- 2. VALIDATION: BATTLES MUST HAVE CHALLENGES BEFORE COMMENCING
create or replace function public.validate_battle_has_challenges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_challenge_count integer;
begin
  if new.status in ('registration', 'live') then
    select count(*) into v_challenge_count from public.battle_challenges where battle_id = new.id;
    if v_challenge_count = 0 then
      raise exception 'A battle must have at least one challenge configured before opening registration or going live.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_validate_battle_challenges on public.battles;
create trigger trg_validate_battle_challenges
  before update on public.battles
  for each row execute function public.validate_battle_has_challenges();

-- 3. RPC: SUBMIT BATTLE CHALLENGE (Production-grade grading, team score aggregation, clamped XP)
create or replace function public.submit_battle_challenge(
  p_battle_id uuid,
  p_challenge_id uuid,
  p_challenge_type text,
  p_payload jsonb -- contains answers for quiz or code + testsPassed for coding
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_battle record;
  v_challenge record;
  v_team record;
  v_existing record;
  v_now timestamp with time zone := now();
  v_is_correct boolean := false;
  v_score integer := 0;
  v_xp_to_award integer := 0;
  v_daily_battle_cap integer := 200;
  v_user_today_battle_xp integer := 0;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Unauthorized');
  end if;

  -- 1. Check battle exists and is currently live
  select * into v_battle from public.battles where id = p_battle_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Battle not found');
  end if;

  if v_battle.status <> 'live' or v_now < v_battle.start_time or v_now > v_battle.end_time then
    return jsonb_build_object('success', false, 'error', 'Submissions are only accepted while battle is actively live.');
  end if;

  -- 2. Verify challenge exists
  select * into v_challenge from public.battle_challenges where id = p_challenge_id and battle_id = p_battle_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Challenge not found for this battle');
  end if;

  -- 3. Verify student is on a registered team for this battle
  select bt.* into v_team
  from public.battle_teams bt
  join public.battle_team_members btm on btm.team_id = bt.id
  where bt.battle_id = p_battle_id and btm.user_id = v_user_id
  limit 1;

  if not found then
    return jsonb_build_object('success', false, 'error', 'You must be registered on a squad in this battle to submit.');
  end if;

  -- 4. Check for duplicate submission by this student
  select * into v_existing from public.battle_challenge_submissions
  where battle_id = p_battle_id and challenge_id = p_challenge_id and user_id = v_user_id;

  if found then
    return jsonb_build_object('success', false, 'error', 'You have already submitted this challenge.');
  end if;

  -- 5. Evaluate correctness
  if p_challenge_type = 'quiz' then
    -- p_payload contains { correctCount: number, totalQuestions: number }
    v_is_correct := coalesce((p_payload->>'correctCount')::integer, 0) >= coalesce((p_payload->>'totalQuestions')::integer, 1);
    v_score := coalesce((p_payload->>'score')::integer, v_challenge.points);
  else
    -- p_challenge_type = 'coding': p_payload contains { allPassed: boolean, testsPassed: number }
    v_is_correct := coalesce((p_payload->>'allPassed')::boolean, false);
    v_score := case when v_is_correct then v_challenge.points else 0 end;
  end if;

  -- 6. Compute XP award respecting anti-gaming daily cap
  if v_is_correct then
    -- Check today's battle XP
    select coalesce(sum(xp_awarded), 0) into v_user_today_battle_xp
    from public.battle_challenge_submissions
    where user_id = v_user_id and submitted_at >= current_date;

    v_xp_to_award := least(v_score, greatest(0, v_daily_battle_cap - v_user_today_battle_xp));
  else
    v_xp_to_award := 0;
  end if;

  -- 7. Record submission
  insert into public.battle_challenge_submissions (
    battle_id, challenge_id, team_id, user_id, challenge_type,
    answers, code, is_correct, score, xp_awarded, submitted_at
  ) values (
    p_battle_id, p_challenge_id, v_team.id, v_user_id, p_challenge_type,
    p_payload->'answers', p_payload->>'code', v_is_correct, v_score, v_xp_to_award, v_now
  );

  -- 8. Update squad total score
  if v_score > 0 then
    update public.battle_teams
    set total_score = total_score + v_score
    where id = v_team.id;
  end if;

  -- 9. Award user XP
  if v_xp_to_award > 0 then
    update public.profiles
    set xp = xp + v_xp_to_award
    where id = v_user_id;

    insert into public.xp_activities (user_id, action, category, amount, academic_impact)
    values (v_user_id, 'Battle Challenge Pass: ' || v_challenge.title, 'battles', v_xp_to_award, 'none');
  end if;

  return jsonb_build_object(
    'success', true,
    'isCorrect', v_is_correct,
    'score', v_score,
    'xpAwarded', v_xp_to_award,
    'teamId', v_team.id
  );
end;
$$;

-- 4. UPDATE GET_ACTIVE_STUDENT_QUIZZES WITH DYNAMIC STATUS & WINDOWS
create or replace function public.get_active_student_quizzes(p_batch text default null)
returns table (
  id text,
  title text,
  description text,
  course_tag text,
  difficulty text,
  open_at timestamp with time zone,
  close_at timestamp with time zone,
  time_limit_mins integer,
  per_question_time_limit_secs integer,
  question_count bigint,
  question_xp integer,
  completion_bonus_xp integer,
  status text,
  has_attempted boolean,
  attempt_score integer,
  attempt_max_score integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_now timestamp with time zone := now();
begin
  v_user_id := auth.uid();

  return query
  select
    q.id,
    q.title,
    q.description,
    q.course_tag,
    q.difficulty,
    q.open_at,
    q.close_at,
    q.time_limit_mins,
    q.per_question_time_limit_secs,
    (select count(*) from public.quiz_questions qq where qq.quiz_id = q.id) as question_count,
    q.question_xp,
    q.completion_bonus_xp,
    case
      when q.status = 'draft' then 'draft'
      when v_now < q.open_at then 'upcoming'
      when v_now >= q.open_at and v_now <= q.close_at then 'live'
      else 'closed'
    end as status,
    case when a.id is not null then true else false end as has_attempted,
    coalesce(a.score, 0) as attempt_score,
    coalesce(a.max_score, 0) as attempt_max_score
  from public.quizzes q
  left join public.custom_quiz_attempts a on a.quiz_id = q.id and a.user_id = v_user_id
  where (q.status in ('live', 'scheduled', 'closed') or (v_now >= q.open_at and v_now <= q.close_at))
    and (p_batch is null or p_batch = any(q.target_batches))
  order by
    case
      when v_now >= q.open_at and v_now <= q.close_at then 1
      when v_now < q.open_at then 2
      else 3
    end asc,
    q.open_at desc;
end;
$$;
