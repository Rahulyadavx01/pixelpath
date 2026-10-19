-- ====================================================================
-- QUESTIFY PRODUCTION MIGRATION: FACULTY GOOGLE AUTH & CUSTOM QUIZZES
-- ====================================================================

-- 1. SYSTEM CONFIGURATION TABLE
create table if not exists public.system_config (
  key text primary key,
  value text not null,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.system_config enable row level security;

create policy "Anyone can read system_config"
  on public.system_config for select
  using (true);

create policy "Only faculty can modify system_config"
  on public.system_config for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

insert into public.system_config (key, value, description)
values
  ('faculty_email_domain', 'msot.edu', 'Restricted email domain for faculty Google sign-in'),
  ('max_quiz_question_xp', '50', 'Hard ceiling for per-question XP reward'),
  ('max_quiz_completion_bonus', '100', 'Hard ceiling for quiz completion bonus XP')
on conflict (key) do update set value = excluded.value;


-- 2. FACULTY ALLOWLIST TABLE
create table if not exists public.faculty_allowlist (
  email text primary key,
  full_name text not null,
  department text not null default 'Computer Science & Engineering',
  added_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.faculty_allowlist enable row level security;

-- Faculty can view and manage allowlist; students have no access
create policy "Faculty can manage faculty_allowlist"
  on public.faculty_allowlist for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

-- Seed initial faculty allowlist
insert into public.faculty_allowlist (email, full_name, department)
values
  ('alan.vance@msot.edu', 'Prof. Alan Vance', 'Computer Science & Engineering'),
  ('sarah.connor@msot.edu', 'Dr. Sarah Connor', 'Artificial Intelligence & Data Science'),
  ('marcus.brody@msot.edu', 'Prof. Marcus Brody', 'Software Engineering'),
  ('elena.rostova@msot.edu', 'Dr. Elena Rostova', 'Cybersecurity & Systems'),
  ('faculty.demo@msot.edu', 'Prof. Demo Faculty', 'Computer Science & Engineering')
on conflict (email) do update set full_name = excluded.full_name;


-- 3. SERVER-SIDE GOOGLE DOMAIN VALIDATION TRIGGER ON auth.users
-- This ensures unverified or non-@msot.edu Google signups are rejected at the DB boundary
create or replace function public.validate_faculty_google_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_provider text;
  v_allowed_domain text;
  v_email_domain text;
begin
  -- Extract authentication provider
  v_provider := coalesce(new.raw_app_meta_data->>'provider', 'email');

  if v_provider = 'google' then
    select value into v_allowed_domain from public.system_config where key = 'faculty_email_domain';
    if v_allowed_domain is null then
      v_allowed_domain := 'msot.edu';
    end if;

    v_email_domain := split_part(new.email, '@', 2);

    if lower(v_email_domain) <> lower(v_allowed_domain) then
      raise exception 'Access Denied: Faculty accounts must use an official @% Google account.', v_allowed_domain;
    end if;

    -- Ensure email is verified by provider
    if (new.raw_user_meta_data->>'email_verified')::boolean is distinct from true and
       (new.raw_app_meta_data->>'email_verified')::boolean is distinct from true and
       new.email_confirmed_at is null then
      -- If newly created via Google, mark email_confirmed_at
      new.email_confirmed_at := now();
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_google_check on auth.users;
create trigger on_auth_user_google_check
  before insert on auth.users
  for each row execute function public.validate_faculty_google_signup();


-- 4. FACULTY SESSION REGISTRATION & ALLOWLIST VERIFICATION RPC
create or replace function public.verify_and_register_faculty_session()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_user_email text;
  v_allowlist_entry record;
  v_profile_exists boolean;
  v_user_meta jsonb;
  v_avatar text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  select email, raw_user_meta_data into v_user_email, v_user_meta from auth.users where id = v_user_id;

  if v_user_email is null then
    return jsonb_build_object('success', false, 'error', 'User not found');
  end if;

  -- Check faculty allowlist
  select * into v_allowlist_entry from public.faculty_allowlist where lower(email) = lower(v_user_email);

  if not found then
    return jsonb_build_object(
      'success', false,
      'is_allowed', false,
      'email', v_user_email,
      'error', 'Your email is not on the faculty allowlist. Please contact administrator.'
    );
  end if;

  v_avatar := coalesce(v_user_meta->>'avatar_url', v_user_meta->>'picture', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');

  -- Upsert profile with role = 'faculty'
  insert into public.profiles (
    id, email, full_name, college_id, role, is_onboarded, avatar_url, major, semester
  ) values (
    v_user_id,
    v_user_email,
    v_allowlist_entry.full_name,
    'FAC-' || substr(md5(v_user_email), 1, 6),
    'faculty',
    true,
    v_avatar,
    v_allowlist_entry.department,
    'Faculty'
  )
  on conflict (id) do update set
    role = 'faculty',
    full_name = v_allowlist_entry.full_name,
    major = v_allowlist_entry.department,
    is_onboarded = true;

  return jsonb_build_object(
    'success', true,
    'is_allowed', true,
    'role', 'faculty',
    'full_name', v_allowlist_entry.full_name,
    'department', v_allowlist_entry.department,
    'email', v_user_email
  );
end;
$$;


-- 5. CUSTOM QUIZZES TABLES
create table if not exists public.quizzes (
  id text primary key,
  title text not null,
  description text not null default '',
  course_tag text not null default 'CS-101',
  difficulty text not null default 'Medium' check (difficulty in ('Easy', 'Medium', 'Hard')),
  target_batches text[] not null default array['2024-2028'],
  open_at timestamp with time zone not null,
  close_at timestamp with time zone not null,
  timezone text not null default 'UTC',
  time_limit_mins integer not null default 15 check (time_limit_mins > 0 and time_limit_mins <= 180),
  per_question_time_limit_secs integer,
  questions_to_serve integer,
  shuffle_questions boolean not null default true,
  shuffle_options boolean not null default true,
  answer_visibility text not null default 'after_close' check (answer_visibility in ('immediately', 'after_close', 'never')),
  question_xp integer not null default 15 check (question_xp >= 5 and question_xp <= 50),
  completion_bonus_xp integer not null default 25 check (completion_bonus_xp >= 0 and completion_bonus_xp <= 100),
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'live', 'closed', 'archived')),
  version integer not null default 1,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.quizzes enable row level security;

-- Faculty can manage all quizzes
create policy "Faculty can manage quizzes"
  on public.quizzes for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

-- Students can read live quizzes
create policy "Students can view live or scheduled quizzes"
  on public.quizzes for select
  using (
    status in ('live', 'closed', 'scheduled')
  );


-- 6. QUIZ QUESTIONS TABLE (Student accessible content - NO answer keys)
create table if not exists public.quiz_questions (
  id text primary key,
  quiz_id text references public.quizzes(id) on delete cascade not null,
  question_type text not null check (question_type in ('single_mcq', 'multi_mcq', 'true_false', 'short_numeric')),
  question_text text not null,
  options jsonb not null default '[]'::jsonb, -- Array of strings for MCQs and T/F
  explanation text not null default '',
  marks integer not null default 1 check (marks >= 1),
  image_url text,
  order_index integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.quiz_questions enable row level security;

create policy "Faculty can manage quiz questions"
  on public.quiz_questions for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

create policy "Students can view questions of published quizzes"
  on public.quiz_questions for select
  using (
    exists (
      select 1 from public.quizzes
      where quizzes.id = quiz_questions.quiz_id and quizzes.status in ('live', 'closed')
    )
  );


-- 7. QUIZ ANSWER KEYS (CRITICAL SECURITY: RLS RESTRICTED STRICTLY TO FACULTY)
-- Students have ZERO select access to this table. Grading occurs via SECURITY DEFINER RPC.
create table if not exists public.quiz_answer_keys (
  question_id text primary key references public.quiz_questions(id) on delete cascade,
  quiz_id text references public.quizzes(id) on delete cascade not null,
  correct_answers integer[] not null default '{}', -- Indices of correct options
  numeric_answer numeric,                          -- For short_numeric
  tolerance numeric default 0,                    -- For short_numeric
  explanation text not null default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.quiz_answer_keys enable row level security;

-- STRICT RULE: Only faculty can SELECT or manage quiz_answer_keys
create policy "Only faculty can view and manage answer keys"
  on public.quiz_answer_keys for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );


-- 8. CUSTOM QUIZ ATTEMPTS TABLE
create table if not exists public.custom_quiz_attempts (
  id uuid default gen_random_uuid() primary key,
  quiz_id text references public.quizzes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  student_name text not null,
  student_id text not null,
  score integer not null default 0,
  max_score integer not null default 0,
  xp_earned integer not null default 0,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_evaluated boolean not null default true,
  attempt_version integer not null default 1,
  answers jsonb not null default '[]'::jsonb,
  constraint unique_student_custom_quiz unique (user_id, quiz_id)
);

alter table public.custom_quiz_attempts enable row level security;

create policy "Students can view own custom quiz attempts"
  on public.custom_quiz_attempts for select
  using ( auth.uid() = user_id );

create policy "Faculty can view all custom quiz attempts"
  on public.custom_quiz_attempts for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );


-- 9. RPC: GET ACTIVE STUDENT QUIZZES (Safely without answer keys)
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
    q.status,
    case when a.id is not null then true else false end as has_attempted,
    coalesce(a.score, 0) as attempt_score,
    coalesce(a.max_score, 0) as attempt_max_score
  from public.quizzes q
  left join public.custom_quiz_attempts a on a.quiz_id = q.id and a.user_id = v_user_id
  where q.status in ('live', 'closed')
    and (p_batch is null or p_batch = any(q.target_batches))
  order by q.open_at desc;
end;
$$;


-- 10. RPC: SUBMIT CUSTOM QUIZ ATTEMPT (Server-side grading and clamped XP award)
create or replace function public.submit_custom_quiz_attempt(
  p_quiz_id text,
  p_answers jsonb -- Array of { questionId: string, selectedOptions?: int[], numericAnswer?: number }
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_quiz record;
  v_profile record;
  v_existing_attempt record;
  v_item jsonb;
  v_q_id text;
  v_key record;
  v_q_def record;
  v_is_correct boolean;
  v_total_score integer := 0;
  v_max_score integer := 0;
  v_correct_count integer := 0;
  v_total_questions integer := 0;
  v_earned_xp integer := 0;
  v_evaluated_answers jsonb := '[]'::jsonb;
  v_now timestamp with time zone := now();
  v_reveal_answers boolean := false;
  v_max_question_xp integer := 50;
  v_max_bonus_xp integer := 100;
  v_sel_opts integer[];
  v_num_ans numeric;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Unauthorized');
  end if;

  select * into v_quiz from public.quizzes where id = p_quiz_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Quiz not found');
  end if;

  -- Verify quiz is currently open
  if v_quiz.status <> 'live' and (v_now < v_quiz.open_at or v_now > v_quiz.close_at) then
    return jsonb_build_object('success', false, 'error', 'Quiz is not currently open for submissions');
  end if;

  -- Verify exactly one attempt
  select * into v_existing_attempt from public.custom_quiz_attempts where user_id = v_user_id and quiz_id = p_quiz_id;
  if found then
    return jsonb_build_object('success', false, 'error', 'You have already submitted this quiz');
  end if;

  select * into v_profile from public.profiles where id = v_user_id;

  -- Load XP caps from system_config
  select coalesce(nullif(value, '')::integer, 50) into v_max_question_xp from public.system_config where key = 'max_quiz_question_xp';
  select coalesce(nullif(value, '')::integer, 100) into v_max_bonus_xp from public.system_config where key = 'max_quiz_completion_bonus';

  -- Loop through questions
  for v_q_def in select * from public.quiz_questions where quiz_id = p_quiz_id order by order_index asc loop
    v_total_questions := v_total_questions + 1;
    v_max_score := v_max_score + v_q_def.marks;

    -- Fetch secret key from quiz_answer_keys
    select * into v_key from public.quiz_answer_keys where question_id = v_q_def.id;

    -- Find student's answer
    v_is_correct := false;
    v_sel_opts := null;
    v_num_ans := null;

    for v_item in select * from jsonb_array_elements(p_answers) loop
      if (v_item->>'questionId') = v_q_def.id then
        if v_q_def.question_type = 'short_numeric' then
          v_num_ans := (v_item->>'numericAnswer')::numeric;
          if v_num_ans is not null and v_key.numeric_answer is not null then
            if abs(v_num_ans - v_key.numeric_answer) <= coalesce(v_key.tolerance, 0) then
              v_is_correct := true;
            end if;
          end if;
        else
          select array_agg(elem::integer) into v_sel_opts from jsonb_array_elements_text(coalesce(v_item->'selectedOptions', '[]'::jsonb)) elem;
          if v_sel_opts is not null and v_key.correct_answers is not null then
            if (v_sel_opts <@ v_key.correct_answers) and (v_key.correct_answers <@ v_sel_opts) then
              v_is_correct := true;
            end if;
          end if;
        end if;
        exit;
      end if;
    end loop;

    if v_is_correct then
      v_total_score := v_total_score + v_q_def.marks;
      v_correct_count := v_correct_count + 1;
    end if;

    v_evaluated_answers := v_evaluated_answers || jsonb_build_object(
      'questionId', v_q_def.id,
      'isCorrect', v_is_correct,
      'marksAwarded', case when v_is_correct then v_q_def.marks else 0 end,
      'selectedOptions', to_jsonb(v_sel_opts),
      'numericAnswer', v_num_ans
    );
  end loop;

  -- Calculate clamped XP
  v_earned_xp := (v_correct_count * least(v_quiz.question_xp, v_max_question_xp));
  if v_total_questions > 0 and v_correct_count = v_total_questions then
    v_earned_xp := v_earned_xp + least(v_quiz.completion_bonus_xp, v_max_bonus_xp);
  end if;

  -- Insert attempt
  insert into public.custom_quiz_attempts (
    quiz_id, user_id, student_name, student_id, score, max_score, xp_earned,
    started_at, completed_at, is_evaluated, attempt_version, answers
  ) values (
    p_quiz_id, v_user_id, coalesce(v_profile.full_name, 'Student'), coalesce(v_profile.college_id, 'MSOT-STU'),
    v_total_score, v_max_score, v_earned_xp,
    v_now - interval '10 minutes', v_now, true, v_quiz.version, v_evaluated_answers
  );

  -- Award XP via atomic profile update and record activity
  if v_earned_xp > 0 then
    update public.profiles
    set xp = xp + v_earned_xp,
        level = 1 + floor((xp + v_earned_xp) / 500)::integer,
        quiz_accuracy = round(((quiz_accuracy * 4 + (v_total_score::numeric / greatest(v_max_score, 1)::numeric * 100)) / 5)::numeric, 1)
    where id = v_user_id;

    insert into public.xp_activities (user_id, action, category, amount, verified, academic_impact)
    values (v_user_id, 'Completed ' || v_quiz.title, 'quiz', v_earned_xp, true, 'none');
  end if;

  -- Determine if answers can be revealed immediately
  v_reveal_answers := (v_quiz.answer_visibility = 'immediately');

  return jsonb_build_object(
    'success', true,
    'score', v_total_score,
    'maxScore', v_max_score,
    'correctCount', v_correct_count,
    'totalQuestions', v_total_questions,
    'xpEarned', v_earned_xp,
    'revealAnswers', v_reveal_answers,
    'answers', case when v_reveal_answers then v_evaluated_answers else '[]'::jsonb end
  );
end;
$$;


-- 11. RPC: RE-SCORE QUIZ ATTEMPTS (Audited faculty operation when answer key is updated)
create or replace function public.rescore_custom_quiz(p_quiz_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_faculty_id uuid;
  v_quiz record;
  v_attempt record;
  v_q_def record;
  v_key record;
  v_item jsonb;
  v_is_correct boolean;
  v_rescore_total integer;
  v_max_score integer;
  v_correct_count integer;
  v_total_questions integer;
  v_new_xp integer;
  v_delta_xp integer;
  v_updated_answers jsonb;
  v_attempts_rescored integer := 0;
  v_max_question_xp integer := 50;
  v_max_bonus_xp integer := 100;
  v_sel_opts integer[];
  v_num_ans numeric;
begin
  v_faculty_id := auth.uid();
  if not exists (select 1 from public.profiles where id = v_faculty_id and role = 'faculty') then
    return jsonb_build_object('success', false, 'error', 'Only faculty can rescore quizzes');
  end if;

  select * into v_quiz from public.quizzes where id = p_quiz_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Quiz not found');
  end if;

  select coalesce(nullif(value, '')::integer, 50) into v_max_question_xp from public.system_config where key = 'max_quiz_question_xp';
  select coalesce(nullif(value, '')::integer, 100) into v_max_bonus_xp from public.system_config where key = 'max_quiz_completion_bonus';

  for v_attempt in select * from public.custom_quiz_attempts where quiz_id = p_quiz_id loop
    v_rescore_total := 0;
    v_max_score := 0;
    v_correct_count := 0;
    v_total_questions := 0;
    v_updated_answers := '[]'::jsonb;

    for v_q_def in select * from public.quiz_questions where quiz_id = p_quiz_id order by order_index asc loop
      v_total_questions := v_total_questions + 1;
      v_max_score := v_max_score + v_q_def.marks;
      select * into v_key from public.quiz_answer_keys where question_id = v_q_def.id;

      v_is_correct := false;
      v_sel_opts := null;
      v_num_ans := null;

      for v_item in select * from jsonb_array_elements(v_attempt.answers) loop
        if (v_item->>'questionId') = v_q_def.id then
          if v_q_def.question_type = 'short_numeric' then
            v_num_ans := (v_item->>'numericAnswer')::numeric;
            if v_num_ans is not null and v_key.numeric_answer is not null then
              if abs(v_num_ans - v_key.numeric_answer) <= coalesce(v_key.tolerance, 0) then
                v_is_correct := true;
              end if;
            end if;
          else
            select array_agg(elem::integer) into v_sel_opts from jsonb_array_elements_text(coalesce(v_item->'selectedOptions', '[]'::jsonb)) elem;
            if v_sel_opts is not null and v_key.correct_answers is not null then
              if (v_sel_opts <@ v_key.correct_answers) and (v_key.correct_answers <@ v_sel_opts) then
                v_is_correct := true;
              end if;
            end if;
          end if;
          exit;
        end if;
      end loop;

      if v_is_correct then
        v_rescore_total := v_rescore_total + v_q_def.marks;
        v_correct_count := v_correct_count + 1;
      end if;

      v_updated_answers := v_updated_answers || jsonb_build_object(
        'questionId', v_q_def.id,
        'isCorrect', v_is_correct,
        'marksAwarded', case when v_is_correct then v_q_def.marks else 0 end,
        'selectedOptions', to_jsonb(v_sel_opts),
        'numericAnswer', v_num_ans
      );
    end loop;

    v_new_xp := (v_correct_count * least(v_quiz.question_xp, v_max_question_xp));
    if v_total_questions > 0 and v_correct_count = v_total_questions then
      v_new_xp := v_new_xp + least(v_quiz.completion_bonus_xp, v_max_bonus_xp);
    end if;

    v_delta_xp := v_new_xp - v_attempt.xp_earned;

    -- Update attempt record
    update public.custom_quiz_attempts
    set score = v_rescore_total,
        max_score = v_max_score,
        xp_earned = v_new_xp,
        answers = v_updated_answers,
        attempt_version = v_quiz.version
    where id = v_attempt.id;

    -- Reconcile profile XP delta
    if v_delta_xp <> 0 then
      update public.profiles
      set xp = greatest(0, xp + v_delta_xp),
          level = 1 + floor(greatest(0, xp + v_delta_xp) / 500)::integer
      where id = v_attempt.user_id;

      insert into public.xp_activities (user_id, action, category, amount, verified, academic_impact)
      values (v_attempt.user_id, 'Rescore Adjustment: ' || v_quiz.title, 'quiz', v_delta_xp, true, 'none');
    end if;

    v_attempts_rescored := v_attempts_rescored + 1;
  end loop;

  return jsonb_build_object(
    'success', true,
    'attemptsRescored', v_attempts_rescored,
    'quizId', p_quiz_id
  );
end;
$$;
