-- ====================================================================
-- QUESTIFY PRODUCTION MIGRATION:
-- DAILY QUEST, C++ ARENA COMPILER TABLES, FACULTY MANAGEMENT & PORTALS
-- ====================================================================

-- 1. DAILY QUESTS TABLE
create table if not exists public.daily_quests (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  statement text not null,
  quest_type text not null check (quest_type in ('coding', 'answer_based')),
  answer_type text check (answer_type in ('numeric', 'short_text', 'mcq')),
  mcq_options jsonb default '[]'::jsonb,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  topic_tag text not null default 'Algorithms',
  target_batches text[] not null default '{"2024-2028"}',
  live_date date not null default current_date,
  open_at timestamp with time zone not null,
  close_at timestamp with time zone not null,
  xp_reward integer not null check (xp_reward between 10 and 100),
  hints text[] default '{}',
  starter_code jsonb default '{"cpp": "#include <iostream>\\nusing namespace std;\\nint main() {\\n    return 0;\\n}\\n"}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'live', 'closed', 'archived')),
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for speedy batch lookups & status filtering
create index if not exists idx_daily_quests_lookup 
  on public.daily_quests(live_date, status);

-- Unique index: only one active/scheduled Daily Quest per target batch on any given date
create unique index if not exists uq_batch_daily_quest_live
  on public.daily_quests(live_date, quest_type)
  where status in ('scheduled', 'live');


-- 2. DAILY QUEST SOLUTIONS (STRICTLY CONCEALED FROM STUDENTS BEFORE EVALUATION)
create table if not exists public.daily_quest_solutions (
  id uuid default gen_random_uuid() primary key,
  quest_id uuid not null references public.daily_quests(id) on delete cascade unique,
  model_solution text not null,
  explanation text not null,
  correct_answer text,
  tolerance numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 3. DAILY QUEST CODING TEST CASES
create table if not exists public.daily_quest_tests (
  id uuid default gen_random_uuid() primary key,
  quest_id uuid not null references public.daily_quests(id) on delete cascade,
  input text not null,
  expected_output text not null,
  is_hidden boolean default false not null,
  order_index integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_daily_quest_tests_quest 
  on public.daily_quest_tests(quest_id, order_index);


-- 4. DAILY QUEST ATTEMPTS (ONE SCORED SUBMISSION PER USER PER QUEST)
create table if not exists public.daily_quest_attempts (
  id uuid default gen_random_uuid() primary key,
  quest_id uuid not null references public.daily_quests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  student_name text not null,
  student_id text not null,
  submission_text text not null,
  language text default 'cpp',
  is_correct boolean not null default false,
  score integer not null default 0,
  xp_awarded integer not null default 0,
  time_taken_seconds integer default 0,
  test_results jsonb default '[]'::jsonb,
  similarity_score numeric default 0,
  is_flagged boolean default false,
  flag_reason text,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint uq_user_daily_quest_attempt unique (quest_id, user_id)
);

create index if not exists idx_daily_quest_attempts_user 
  on public.daily_quest_attempts(user_id, quest_id);


-- 5. FACULTY CODING PROBLEMS & VERSION AUDIT TABLES
create table if not exists public.coding_problems (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  xp_reward integer not null default 50 check (xp_reward between 10 and 150),
  tags text[] default '{}',
  description text not null,
  constraints text[] default '{}',
  starter_code jsonb not null default '{"cpp": "", "python": "", "javascript": "", "java": ""}'::jsonb,
  solution_explanation text,
  time_limit_ms integer default 2000,
  memory_limit_mb integer default 128,
  is_published boolean default true not null,
  version integer default 1 not null,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.coding_problem_tests (
  id uuid default gen_random_uuid() primary key,
  problem_id uuid not null references public.coding_problems(id) on delete cascade,
  input text not null,
  expected_output text not null,
  is_hidden boolean default false not null,
  order_index integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.coding_problem_versions (
  id uuid default gen_random_uuid() primary key,
  problem_id uuid not null references public.coding_problems(id) on delete cascade,
  version integer not null,
  changed_by uuid references public.profiles(id),
  snapshot jsonb not null,
  change_summary text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

alter table public.daily_quests enable row level security;
alter table public.daily_quest_solutions enable row level security;
alter table public.daily_quest_tests enable row level security;
alter table public.daily_quest_attempts enable row level security;
alter table public.coding_problems enable row level security;
alter table public.coding_problem_tests enable row level security;
alter table public.coding_problem_versions enable row level security;

-- DAILY QUESTS
create policy "Anyone authenticated can view active or past daily_quests"
  on public.daily_quests for select
  using (
    status in ('live', 'closed')
    or exists (
      select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

create policy "Faculty can manage daily_quests"
  on public.daily_quests for all
  using (
    exists (
      select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

-- DAILY QUEST SOLUTIONS (STRICT ISOLATION)
-- Students can ONLY SELECT after submitting their attempt OR when quest has closed
create policy "Student conditional read on daily_quest_solutions"
  on public.daily_quest_solutions for select
  using (
    exists (
      select 1 from public.daily_quest_attempts a
      where a.quest_id = daily_quest_solutions.quest_id and a.user_id = auth.uid()
    )
    or exists (
      select 1 from public.daily_quests q
      where q.id = daily_quest_solutions.quest_id and q.close_at <= timezone('utc'::text, now())
    )
    or exists (
      select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

create policy "Faculty can manage daily_quest_solutions"
  on public.daily_quest_solutions for all
  using (
    exists (
      select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

-- DAILY QUEST TESTS
-- Students can only read visible tests
create policy "Students can view visible daily quest tests"
  on public.daily_quest_tests for select
  using (
    is_hidden = false
    or exists (
      select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

create policy "Faculty can manage daily quest tests"
  on public.daily_quest_tests for all
  using (
    exists (
      select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

-- DAILY QUEST ATTEMPTS
create policy "Users can read own daily quest attempts"
  on public.daily_quest_attempts for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

create policy "Users can insert own daily quest attempt"
  on public.daily_quest_attempts for insert
  with check (user_id = auth.uid());

-- CODING PROBLEMS
create policy "Students can view published coding problems"
  on public.coding_problems for select
  using (
    is_published = true
    or exists (
      select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

create policy "Faculty can manage coding problems"
  on public.coding_problems for all
  using (
    exists (
      select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

-- CODING PROBLEM TESTS
create policy "Students can view visible coding problem tests"
  on public.coding_problem_tests for select
  using (
    is_hidden = false
    or exists (
      select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

create policy "Faculty can manage coding problem tests"
  on public.coding_problem_tests for all
  using (
    exists (
      select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

create policy "Faculty can view coding problem versions"
  on public.coding_problem_versions for all
  using (
    exists (
      select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );


-- ====================================================================
-- SECURITY DEFINER STORED PROCEDURES & REVENUE LOGIC
-- ====================================================================

-- Procedure to submit and grade an Answer-based Daily Quest
create or replace function public.submit_daily_quest_answer(
  p_quest_id uuid,
  p_answer text,
  p_time_taken integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quest record;
  v_solution record;
  v_profile record;
  v_is_correct boolean := false;
  v_xp_to_award integer := 0;
  v_attempt_id uuid;
  v_norm_answer text;
  v_norm_correct text;
  v_is_flagged boolean := false;
  v_flag_reason text;
begin
  -- 1. Authenticate caller
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into v_profile from public.profiles where id = auth.uid();
  if not found then
    raise exception 'Profile not found';
  end if;

  -- 2. Verify quest exists, is live, and within time window
  select * into v_quest from public.daily_quests where id = p_quest_id;
  if not found then
    raise exception 'Daily Quest not found';
  end if;

  if v_quest.status <> 'live' and timezone('utc'::text, now()) not between v_quest.open_at and v_quest.close_at then
    raise exception 'Daily Quest is not currently open for submission';
  end if;

  -- 3. Check for duplicate attempt (Strictly one attempt per student per quest)
  if exists (select 1 from public.daily_quest_attempts where quest_id = p_quest_id and user_id = auth.uid()) then
    raise exception 'You have already submitted an attempt for this Daily Quest';
  end if;

  -- 4. Retrieve solution securely
  select * into v_solution from public.daily_quest_solutions where quest_id = p_quest_id;
  if not found then
    raise exception 'Solution not configured for this quest';
  end if;

  -- 5. Grade answer
  v_norm_answer := trim(lower(p_answer));
  v_norm_correct := trim(lower(v_solution.correct_answer));

  if v_quest.answer_type = 'numeric' then
    if abs((v_norm_answer::numeric) - (v_norm_correct::numeric)) <= coalesce(v_solution.tolerance, 0) then
      v_is_correct := true;
    end if;
  else
    if v_norm_answer = v_norm_correct then
      v_is_correct := true;
    end if;
  end if;

  -- 6. Anti-gaming checks
  if p_time_taken < 4 then
    v_is_flagged := true;
    v_flag_reason := 'Suspiciously fast answer completion (< 4s)';
  end if;

  -- 7. Calculate and award XP if correct
  if v_is_correct then
    v_xp_to_award := least(greatest(v_quest.xp_reward, 10), 100);
    perform public.award_verified_xp(
      auth.uid(),
      v_xp_to_award,
      'daily_quest',
      'Daily Quest: ' || v_quest.title,
      p_quest_id::text
    );

    -- Increment streak
    update public.profiles
    set streak_days = streak_days + 1
    where id = auth.uid();
  end if;

  -- 8. Record immutable attempt
  insert into public.daily_quest_attempts (
    quest_id,
    user_id,
    student_name,
    student_id,
    submission_text,
    language,
    is_correct,
    score,
    xp_awarded,
    time_taken_seconds,
    is_flagged,
    flag_reason
  ) values (
    p_quest_id,
    auth.uid(),
    v_profile.name,
    coalesce(v_profile.college_id, 'MSOT-000'),
    p_answer,
    'answer',
    v_is_correct,
    case when v_is_correct then 100 else 0 end,
    v_xp_to_award,
    p_time_taken,
    v_is_flagged,
    v_flag_reason
  ) returning id into v_attempt_id;

  -- 9. Return evaluated breakdown with revealed solution
  return jsonb_build_object(
    'attemptId', v_attempt_id,
    'isCorrect', v_is_correct,
    'xpAwarded', v_xp_to_award,
    'modelSolution', v_solution.model_solution,
    'explanation', v_solution.explanation,
    'correctAnswer', v_solution.correct_answer
  );
end;
$$;


-- Procedure to record a Coding Daily Quest Submission
create or replace function public.submit_daily_quest_coding(
  p_quest_id uuid,
  p_code text,
  p_language text,
  p_test_results jsonb,
  p_all_passed boolean,
  p_time_taken integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quest record;
  v_solution record;
  v_profile record;
  v_xp_to_award integer := 0;
  v_attempt_id uuid;
  v_is_flagged boolean := false;
  v_flag_reason text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into v_profile from public.profiles where id = auth.uid();
  select * into v_quest from public.daily_quests where id = p_quest_id;
  select * into v_solution from public.daily_quest_solutions where quest_id = p_quest_id;

  if exists (select 1 from public.daily_quest_attempts where quest_id = p_quest_id and user_id = auth.uid()) then
    raise exception 'You have already submitted an attempt for this Daily Quest';
  end if;

  -- Anti-cheat similarity & speed check
  if p_time_taken < 15 and p_all_passed then
    v_is_flagged := true;
    v_flag_reason := 'Instant coding solution submitted (< 15s)';
  end if;

  if p_all_passed then
    v_xp_to_award := least(greatest(v_quest.xp_reward, 10), 100);
    perform public.award_verified_xp(
      auth.uid(),
      v_xp_to_award,
      'daily_quest',
      'Daily Quest (Coding): ' || v_quest.title,
      p_quest_id::text
    );

    update public.profiles
    set streak_days = streak_days + 1
    where id = auth.uid();
  end if;

  insert into public.daily_quest_attempts (
    quest_id,
    user_id,
    student_name,
    student_id,
    submission_text,
    language,
    is_correct,
    score,
    xp_awarded,
    time_taken_seconds,
    test_results,
    is_flagged,
    flag_reason
  ) values (
    p_quest_id,
    auth.uid(),
    v_profile.name,
    coalesce(v_profile.college_id, 'MSOT-000'),
    p_code,
    coalesce(p_language, 'cpp'),
    p_all_passed,
    case when p_all_passed then 100 else 0 end,
    v_xp_to_award,
    p_time_taken,
    p_test_results,
    v_is_flagged,
    v_flag_reason
  ) returning id into v_attempt_id;

  return jsonb_build_object(
    'attemptId', v_attempt_id,
    'isCorrect', p_all_passed,
    'xpAwarded', v_xp_to_award,
    'modelSolution', coalesce(v_solution.model_solution, ''),
    'explanation', coalesce(v_solution.explanation, '')
  );
end;
$$;


-- Scheduled status transition runner (Scheduled -> Live, Live -> Closed)
create or replace function public.refresh_daily_quest_statuses()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Move Scheduled to Live when current time has reached open_at
  update public.daily_quests
  set status = 'live', updated_at = timezone('utc'::text, now())
  where status = 'scheduled'
    and timezone('utc'::text, now()) >= open_at
    and timezone('utc'::text, now()) < close_at;

  -- Move Live to Closed when close_at has expired
  update public.daily_quests
  set status = 'closed', updated_at = timezone('utc'::text, now())
  where status = 'live'
    and timezone('utc'::text, now()) >= close_at;
end;
$$;
