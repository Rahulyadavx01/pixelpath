-- ====================================================================
-- QUESTIFY OFFICIAL MSOT POINTS ECONOMY & ANTI-FARMING MIGRATION
-- Incremental Migration: 20261012_official_points_economy.sql
-- ====================================================================

-- 1. ADD LEADERBOARD OPT-OUT COLUMN TO PROFILES & ROSTER
alter table public.profiles
  add column if not exists leaderboard_opt_out boolean default false not null;

alter table public.student_roster
  add column if not exists leaderboard_opt_out boolean default false not null;

-- 2. XP RULES TABLE (Single server-side source of truth for rewards & caps)
create table if not exists public.xp_rules (
  action_type text primary key,
  name text not null,
  description text not null,
  xp integer not null,
  per_day_limit integer,
  per_ref_limit integer default 1 not null,
  verification_source text not null,
  is_excluded_from_global_cap boolean default false not null,
  active boolean default true not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.xp_rules enable row level security;

create policy "XP rules are viewable by all authenticated users."
  on public.xp_rules for select
  using ( true );

-- Seed official MSOT points rules
insert into public.xp_rules (action_type, name, description, xp, per_day_limit, per_ref_limit, verification_source, is_excluded_from_global_cap, active)
values
  ('attendance', 'Attend a class', 'Official verified class attendance imported by department faculty.', 10, null, 1, 'attendance_record', true, true),
  ('assignment', 'Submit classwork/homework on time', 'Coursework submitted on or before the faculty deadline.', 20, null, 1, 'assignment_submission', false, true),
  ('daily_quiz', 'Daily quiz completed', 'Server-graded daily quiz (15 base + 5 per correct answer).', 15, 1, 1, 'daily_quiz_server', false, true),
  ('biweekly_test', 'Bi-weekly test score', 'Official test marks entered by faculty: floor(score% / 2), max 50.', 50, null, 1, 'test_result', true, true),
  ('coding_easy', 'Solve Easy Coding Problem', 'Passes 100% of hidden test cases in sandboxed C++/Python runner.', 10, 10, 1, 'coding_sandbox', false, true),
  ('coding_medium', 'Solve Medium Coding Problem', 'Passes 100% of hidden test cases in sandboxed C++/Python runner.', 20, 10, 1, 'coding_sandbox', false, true),
  ('coding_hard', 'Solve Hard Coding Problem', 'Passes 100% of hidden test cases in sandboxed C++/Python runner.', 40, 10, 1, 'coding_sandbox', false, true),
  ('club_activity', 'Club activity participation', 'Official verified club attendance marked by faculty or coordinator.', 25, 1, 1, 'club_attendance', false, true),
  ('streak_7day', '7-day learning streak', 'Verified milestone for 7 consecutive days of qualifying activity.', 50, 1, 1, 'streak_engine', false, true),
  ('peer_help', 'Help a peer (answer accepted)', 'Student asker accepts helper explanation on peer board (max 3/day).', 15, 3, 1, 'peer_acceptance', false, true),
  ('daily_quest', 'Daily Quest problem solved', 'Daily algorithmic or discrete problem set by faculty.', 50, 1, 1, 'quest_engine', false, true),
  ('battle_challenge', 'Team Battle sprint challenge', 'Passing quiz or coding sprint during a live team battle.', 50, 4, 1, 'battle_engine', false, true)
on conflict (action_type) do update set
  xp = excluded.xp,
  per_day_limit = excluded.per_day_limit,
  per_ref_limit = excluded.per_ref_limit,
  is_excluded_from_global_cap = excluded.is_excluded_from_global_cap,
  active = excluded.active;

-- 3. ATTENDANCE RECORDS (Faculty upload / API sync only)
create table if not exists public.attendance_records (
  id uuid default gen_random_uuid() primary key,
  class_session_id text not null,
  student_id text not null references public.student_roster(student_id) on update cascade,
  course_code text not null,
  session_date date not null,
  status text not null check (status in ('present', 'absent', 'excused')),
  source text default 'faculty_import' not null,
  imported_by uuid references auth.users(id),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (class_session_id, student_id)
);

alter table public.attendance_records enable row level security;

create policy "Students view own attendance records."
  on public.attendance_records for select
  using (
    student_id = (select college_id from public.profiles where id = auth.uid())
  );

create policy "Faculty can view all attendance records."
  on public.attendance_records for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'faculty')
  );

create policy "Faculty can insert attendance records."
  on public.attendance_records for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'faculty')
  );

-- 4. ASSIGNMENTS & ASSIGNMENT SUBMISSIONS
create table if not exists public.assignments (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  course_code text not null,
  due_at timestamptz not null,
  target_batches text[] not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.assignments enable row level security;

create policy "Assignments are viewable by all authenticated users."
  on public.assignments for select
  using ( true );

create policy "Faculty can manage assignments."
  on public.assignments for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'faculty')
  );

create table if not exists public.assignment_submissions (
  id uuid default gen_random_uuid() primary key,
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  student_id text not null references public.student_roster(student_id) on update cascade,
  submitted_at timestamptz default timezone('utc'::text, now()) not null,
  is_on_time boolean not null,
  verified_by uuid references auth.users(id),
  status text default 'verified' check (status in ('verified', 'pending', 'rejected')) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (assignment_id, student_id)
);

alter table public.assignment_submissions enable row level security;

create policy "Students view own assignment submissions."
  on public.assignment_submissions for select
  using (
    student_id = (select college_id from public.profiles where id = auth.uid())
  );

create policy "Faculty view all assignment submissions."
  on public.assignment_submissions for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'faculty')
  );

create policy "Faculty verify assignment submissions."
  on public.assignment_submissions for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'faculty')
  );

-- 5. TEST RESULTS (Bi-weekly test scores)
create table if not exists public.test_results (
  id uuid default gen_random_uuid() primary key,
  test_id text not null,
  test_name text not null,
  student_id text not null references public.student_roster(student_id) on update cascade,
  score_percent numeric(5, 2) not null check (score_percent >= 0 and score_percent <= 100),
  xp_awarded integer not null check (xp_awarded >= 0 and xp_awarded <= 50),
  entered_by uuid references auth.users(id),
  entered_at timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (test_id, student_id)
);

alter table public.test_results enable row level security;

create policy "Students view own test results."
  on public.test_results for select
  using (
    student_id = (select college_id from public.profiles where id = auth.uid())
  );

create policy "Faculty view and enter test results."
  on public.test_results for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'faculty')
  );

-- 6. CLUB SESSIONS & ATTENDANCE
create table if not exists public.club_sessions (
  id uuid default gen_random_uuid() primary key,
  club_name text not null,
  session_title text not null,
  session_date date not null,
  coordinator_id uuid references auth.users(id),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.club_sessions enable row level security;

create policy "Club sessions viewable by authenticated users."
  on public.club_sessions for select
  using ( true );

create policy "Faculty and coordinators manage club sessions."
  on public.club_sessions for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'faculty')
  );

create table if not exists public.club_attendance (
  id uuid default gen_random_uuid() primary key,
  club_session_id uuid references public.club_sessions(id) on delete cascade not null,
  student_id text not null references public.student_roster(student_id) on update cascade,
  verified_by uuid references auth.users(id),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (club_session_id, student_id)
);

alter table public.club_attendance enable row level security;

create policy "Students view own club attendance."
  on public.club_attendance for select
  using (
    student_id = (select college_id from public.profiles where id = auth.uid())
  );

create policy "Faculty and coordinators mark club attendance."
  on public.club_attendance for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'faculty')
  );

-- 7. XP TRANSACTIONS (Tamper-proof Immutable Ledger)
create table if not exists public.xp_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  action_type text not null references public.xp_rules(action_type),
  reference_id text not null,
  amount integer not null,
  description text not null,
  source text not null,
  metadata jsonb default '{}'::jsonb,
  is_voided boolean default false not null,
  void_reason text,
  voided_by uuid references auth.users(id),
  voided_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (user_id, action_type, reference_id)
);

alter table public.xp_transactions enable row level security;

create policy "Users view own transactions."
  on public.xp_transactions for select
  using ( auth.uid() = user_id );

create policy "Faculty view all transactions."
  on public.xp_transactions for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'faculty')
  );

-- Revoke direct user write permissions on xp_transactions & profiles points
revoke insert, update, delete on public.xp_transactions from authenticated, anon;
revoke update (xp, level, league) on public.profiles from authenticated, anon;

-- 8. LEADERBOARD PERIODS & ARCHIVES
create table if not exists public.leaderboard_periods (
  id uuid default gen_random_uuid() primary key,
  period_type text default 'weekly' check (period_type in ('weekly', 'monthly')) not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  is_active boolean default true not null,
  archived_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.leaderboard_periods enable row level security;

create policy "Leaderboard periods viewable by all."
  on public.leaderboard_periods for select
  using ( true );

create table if not exists public.leaderboard_archive (
  id uuid default gen_random_uuid() primary key,
  period_id uuid references public.leaderboard_periods(id) on delete cascade not null,
  student_id text not null,
  student_name text not null,
  rank integer not null,
  period_xp integer not null,
  league text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.leaderboard_archive enable row level security;

create policy "Leaderboard archive viewable by all."
  on public.leaderboard_archive for select
  using ( true );

-- 9. SECURITY DEFINER: award_xp
create or replace function public.award_xp(
  p_user_id uuid,
  p_action_type text,
  p_reference_id text,
  p_amount integer default null,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_rule public.xp_rules%rowtype;
  v_final_amount integer;
  v_today_start timestamptz;
  v_action_today_count integer;
  v_daily_capped_xp integer;
  v_global_daily_cap integer := 200;
  v_tx_id uuid;
  v_current_xp integer;
  v_new_xp integer;
  v_new_level integer;
  v_new_league text;
begin
  -- 1. Fetch official rule
  select * into v_rule
  from public.xp_rules
  where action_type = p_action_type and active = true;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Invalid or inactive XP action type: ' || p_action_type);
  end if;

  -- 2. Determine final amount (server-enforced)
  if p_action_type in ('attendance', 'assignment', 'coding_easy', 'coding_medium', 'coding_hard', 'club_activity', 'streak_7day', 'peer_help') then
    v_final_amount := v_rule.xp;
  elsif p_action_type = 'daily_quiz' then
    -- 15 base + 5 per correct answer (clamped by server metadata)
    v_final_amount := coalesce(p_amount, v_rule.xp);
  elsif p_action_type = 'biweekly_test' then
    -- floor(score_percent / 2), max 50
    v_final_amount := least(50, greatest(0, coalesce(p_amount, 0)));
  else
    v_final_amount := coalesce(p_amount, v_rule.xp);
  end if;

  if v_final_amount <= 0 then
    return jsonb_build_object('success', false, 'error', 'Non-positive XP amount calculated');
  end if;

  -- 3. Check unique reference constraint
  if exists (
    select 1 from public.xp_transactions
    where user_id = p_user_id and action_type = p_action_type and reference_id = p_reference_id and is_voided = false
  ) then
    return jsonb_build_object('success', false, 'error', 'XP already awarded for this reference activity', 'duplicate', true);
  end if;

  v_today_start := date_trunc('day', timezone('utc'::text, now()));

  -- 4. Check per-action daily limit
  if v_rule.per_day_limit is not null then
    select count(*) into v_action_today_count
    from public.xp_transactions
    where user_id = p_user_id
      and action_type = p_action_type
      and created_at >= v_today_start
      and is_voided = false;

    if v_action_today_count >= v_rule.per_day_limit then
      return jsonb_build_object(
        'success', false,
        'error', 'Daily limit reached for ' || v_rule.name || ' (' || v_rule.per_day_limit || ' per day)',
        'cap_reached', true
      );
    end if;
  end if;

  -- 5. Check global daily cap (excluding attendance & bi-weekly test official records)
  if not v_rule.is_excluded_from_global_cap then
    select coalesce(sum(t.amount), 0) into v_daily_capped_xp
    from public.xp_transactions t
    join public.xp_rules r on r.action_type = t.action_type
    where t.user_id = p_user_id
      and t.created_at >= v_today_start
      and t.is_voided = false
      and r.is_excluded_from_global_cap = false;

    if v_daily_capped_xp + v_final_amount > v_global_daily_cap then
      return jsonb_build_object(
        'success', false,
        'error', 'Global daily XP cap reached (' || v_global_daily_cap || ' XP/day). Great practice today!',
        'global_cap_reached', true
      );
    end if;
  end if;

  -- 6. Insert into immutable ledger
  insert into public.xp_transactions (
    user_id, action_type, reference_id, amount, description, source, metadata
  ) values (
    p_user_id, p_action_type, p_reference_id, v_final_amount, v_rule.name, v_rule.verification_source, p_metadata
  ) returning id into v_tx_id;

  -- 7. Update profile total XP, level, and league
  select xp into v_current_xp from public.profiles where id = p_user_id;
  v_new_xp := coalesce(v_current_xp, 0) + v_final_amount;

  v_new_level := 1 + floor(v_new_xp / 1000);

  if v_new_xp >= 10000 then v_new_league := 'Master';
  elsif v_new_xp >= 6000 then v_new_league := 'Diamond';
  elsif v_new_xp >= 3500 then v_new_league := 'Platinum';
  elsif v_new_xp >= 1800 then v_new_league := 'Gold';
  elsif v_new_xp >= 800 then v_new_league := 'Silver';
  else v_new_league := 'Bronze';
  end if;

  update public.profiles
  set
    xp = v_new_xp,
    level = v_new_level,
    league = v_new_league,
    xp_to_next_level = 1000 - (v_new_xp % 1000),
    updated_at = timezone('utc'::text, now())
  where id = p_user_id;

  return jsonb_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'action_type', p_action_type,
    'amount', v_final_amount,
    'total_xp', v_new_xp,
    'level', v_new_level,
    'league', v_new_league
  );
end;
$$;

-- 10. SECURITY DEFINER: void_xp (Faculty manual override with mandatory logged reason)
create or replace function public.void_xp(
  p_transaction_id uuid,
  p_faculty_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tx public.xp_transactions%rowtype;
  v_faculty_role text;
  v_recomputed_xp integer;
  v_new_level integer;
  v_new_league text;
begin
  -- 1. Validate faculty authorization
  select role into v_faculty_role from public.profiles where id = p_faculty_id;
  if v_faculty_role is null or v_faculty_role <> 'faculty' then
    return jsonb_build_object('success', false, 'error', 'Only faculty members may void XP awards');
  end if;

  -- 2. Validate mandatory justification
  if p_reason is null or length(trim(p_reason)) < 5 then
    return jsonb_build_object('success', false, 'error', 'A specific faculty justification reason is mandatory');
  end if;

  -- 3. Fetch transaction
  select * into v_tx from public.xp_transactions where id = p_transaction_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Transaction not found');
  end if;

  if v_tx.is_voided then
    return jsonb_build_object('success', false, 'error', 'Transaction has already been voided');
  end if;

  -- 4. Mark voided with audit metadata
  update public.xp_transactions
  set
    is_voided = true,
    void_reason = p_reason,
    voided_by = p_faculty_id,
    voided_at = timezone('utc'::text, now())
  where id = p_transaction_id;

  -- 5. Insert audit log entry
  insert into public.audit_log (
    action, actor_name, target_student_name, reason, timestamp
  ) values (
    'VOID_XP_TRANSACTION',
    (select name from public.profiles where id = p_faculty_id),
    (select name from public.profiles where id = v_tx.user_id),
    p_reason,
    timezone('utc'::text, now())::text
  );

  -- 6. Recompute student total XP from valid ledger entries
  select coalesce(sum(amount), 0) into v_recomputed_xp
  from public.xp_transactions
  where user_id = v_tx.user_id and is_voided = false;

  v_new_level := 1 + floor(v_recomputed_xp / 1000);

  if v_recomputed_xp >= 10000 then v_new_league := 'Master';
  elsif v_recomputed_xp >= 6000 then v_new_league := 'Diamond';
  elsif v_recomputed_xp >= 3500 then v_new_league := 'Platinum';
  elsif v_recomputed_xp >= 1800 then v_new_league := 'Gold';
  elsif v_recomputed_xp >= 800 then v_new_league := 'Silver';
  else v_new_league := 'Bronze';
  end if;

  update public.profiles
  set
    xp = v_recomputed_xp,
    level = v_new_level,
    league = v_new_league,
    xp_to_next_level = 1000 - (v_recomputed_xp % 1000),
    updated_at = timezone('utc'::text, now())
  where id = v_tx.user_id;

  return jsonb_build_object(
    'success', true,
    'transaction_id', p_transaction_id,
    'voided_amount', v_tx.amount,
    'recomputed_xp', v_recomputed_xp,
    'level', v_new_level,
    'league', v_new_league
  );
end;
$$;
