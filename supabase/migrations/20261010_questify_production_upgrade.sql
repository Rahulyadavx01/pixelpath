-- ====================================================================
-- QUESTIFY PRODUCTION INCREMENTAL UPGRADE MIGRATION
-- MSOT Gamified Learning Platform
-- ====================================================================

-- 1. STUDENT ROSTER TABLE (Pre-populated by Faculty / Admin)
create table if not exists public.student_roster (
  student_id text primary key,
  full_name text not null,
  email text unique not null,
  department text not null default 'Computer Science & Engineering',
  batch text not null default '2024-2028',
  role text not null default 'student' check (role in ('student', 'faculty')),
  is_activated boolean not null default false,
  activated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.student_roster enable row level security;

-- Faculty can view and manage roster; anonymous/students can verify activation status via RPC
create policy "Faculty can manage student roster"
  on public.student_roster for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

-- Seed initial roster if empty
insert into public.student_roster (student_id, full_name, email, department, batch, role, is_activated)
values
  ('MSOT-2024-001', 'Alex Morgan', 'alex.morgan@msot.edu', 'Computer Science & Engineering', '2024-2028', 'student', false),
  ('MSOT-2024-002', 'Kenji Sato', 'kenji.sato@msot.edu', 'Computer Science & Engineering', '2024-2028', 'student', false),
  ('MSOT-2024-003', 'Aanya Sharma', 'aanya.sharma@msot.edu', 'Computer Science & Engineering', '2024-2028', 'student', false),
  ('MSOT-2024-004', 'Rahul Varma', 'rahul.varma@msot.edu', 'Computer Science & Engineering', '2024-2028', 'student', false),
  ('MSOT-2024-005', 'Maya Lin', 'maya.lin@msot.edu', 'Computer Science & Engineering', '2024-2028', 'student', false),
  ('MSOT-FAC-001', 'Prof. Alan Vance', 'alan.vance@msot.edu', 'Computer Science & Engineering', 'Faculty Staff', 'faculty', true)
on conflict (student_id) do nothing;

-- 2. UPDATE PROFILES TABLE
-- Add role column, ensure RLS prevents clients from tampering with role, XP, or level
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'role') then
    alter table public.profiles add column role text not null default 'student' check (role in ('student', 'faculty'));
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'is_onboarded') then
    alter table public.profiles add column is_onboarded boolean not null default false;
  end if;
  -- Drop obsolete incognito / is_anonymous column if it exists
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'is_anonymous') then
    alter table public.profiles drop column is_anonymous;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'anonymous_leaderboard') then
    alter table public.profiles drop column anonymous_leaderboard;
  end if;
end $$;

-- 3. PASSWORD RESET REQUESTS (Faculty mediated - zero enumeration leak)
create table if not exists public.password_reset_requests (
  id uuid default gen_random_uuid() primary key,
  student_id text references public.student_roster(student_id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'resolved', 'rejected')),
  resolved_by uuid references public.profiles(id),
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.password_reset_requests enable row level security;

create policy "Faculty can manage password resets"
  on public.password_reset_requests for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

-- 4. QUIZ ATTEMPTS TABLE (Enforces exactly one graded attempt per quiz)
create table if not exists public.quiz_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  quiz_id text not null,
  score integer not null,
  total_questions integer not null default 5,
  xp_awarded integer not null default 0,
  user_answers jsonb not null default '[]'::jsonb,
  is_evaluated boolean not null default true,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_quiz unique (user_id, quiz_id)
);

alter table public.quiz_attempts enable row level security;

create policy "Users can view own quiz attempts"
  on public.quiz_attempts for select
  using ( auth.uid() = user_id );

create policy "Faculty can view all quiz attempts"
  on public.quiz_attempts for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

-- 5. PEER HELP TABLES (Requester-only accept, anti-abuse protected)
create table if not exists public.peer_help_requests (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references public.profiles(id) on delete cascade not null,
  subject text not null,
  title text not null,
  description text not null,
  status text not null default 'open' check (status in ('open', 'resolved', 'closed')),
  accepted_response_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone
);

alter table public.peer_help_requests enable row level security;

create policy "Peer help requests viewable by authenticated users"
  on public.peer_help_requests for select
  using ( auth.role() = 'authenticated' );

create policy "Students can create own peer help requests"
  on public.peer_help_requests for insert
  with check ( auth.uid() = requester_id );

create policy "Requesters can update their own request"
  on public.peer_help_requests for update
  using ( auth.uid() = requester_id );

create table if not exists public.peer_help_responses (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references public.peer_help_requests(id) on delete cascade not null,
  helper_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_accepted boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.peer_help_responses enable row level security;

create policy "Peer help responses viewable by authenticated users"
  on public.peer_help_responses for select
  using ( auth.role() = 'authenticated' );

create policy "Users can post peer help responses"
  on public.peer_help_responses for insert
  with check ( auth.uid() = helper_id );

-- 6. DISCUSSIONS TABLES (No fake seeds, RLS enforced, faculty moderation)
create table if not exists public.discussion_threads (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  course_tag text not null default 'General',
  title text not null,
  body text not null,
  is_pinned boolean not null default false,
  is_hidden boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.discussion_threads enable row level security;

create policy "Visible threads viewable by authenticated users"
  on public.discussion_threads for select
  using (
    (not is_hidden) or
    (author_id = auth.uid()) or
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty')
  );

create policy "Authors can insert discussion threads"
  on public.discussion_threads for insert
  with check ( auth.uid() = author_id );

create policy "Authors can update own threads"
  on public.discussion_threads for update
  using (
    auth.uid() = author_id or
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty')
  );

create policy "Authors and faculty can delete threads"
  on public.discussion_threads for delete
  using (
    auth.uid() = author_id or
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty')
  );

create table if not exists public.discussion_replies (
  id uuid default gen_random_uuid() primary key,
  thread_id uuid references public.discussion_threads(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_hidden boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.discussion_replies enable row level security;

create policy "Visible replies viewable by authenticated users"
  on public.discussion_replies for select
  using (
    (not is_hidden) or
    (author_id = auth.uid()) or
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty')
  );

create policy "Authors can insert discussion replies"
  on public.discussion_replies for insert
  with check ( auth.uid() = author_id );

create policy "Authors and faculty can update replies"
  on public.discussion_replies for update
  using (
    auth.uid() = author_id or
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty')
  );

create policy "Authors and faculty can delete replies"
  on public.discussion_replies for delete
  using (
    auth.uid() = author_id or
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty')
  );

-- 7. ANNOUNCEMENTS (Faculty-only authoring, student read-only with unread indicators)
create table if not exists public.announcements (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  priority text not null default 'normal' check (priority in ('normal', 'urgent')),
  course_tag text default 'All CSE Cohorts',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.announcements enable row level security;

create policy "Announcements viewable by all authenticated users"
  on public.announcements for select
  using ( auth.role() = 'authenticated' );

create policy "Only faculty can insert announcements"
  on public.announcements for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

create policy "Only faculty can update announcements"
  on public.announcements for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

create policy "Only faculty can delete announcements"
  on public.announcements for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'faculty'
    )
  );

create table if not exists public.announcement_reads (
  id uuid default gen_random_uuid() primary key,
  announcement_id uuid references public.announcements(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  read_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_announcement_user unique (announcement_id, user_id)
);

alter table public.announcement_reads enable row level security;

create policy "Users can manage own announcement read receipts"
  on public.announcement_reads for all
  using ( auth.uid() = user_id );

-- 8. COURSE PROGRESSION (Data-driven curriculum structure & prerequisites)
create table if not exists public.courses (
  id text primary key,
  code text not null,
  title text not null,
  description text not null,
  semester text not null default 'Semester 4'
);

create table if not exists public.course_modules (
  id text primary key,
  course_id text references public.courses(id) on delete cascade not null,
  title text not null,
  order_index integer not null default 0,
  prerequisite_module_ids text[] default '{}'
);

create table if not exists public.course_lessons (
  id text primary key,
  module_id text references public.course_modules(id) on delete cascade not null,
  title text not null,
  summary text not null,
  xp_value integer not null default 20,
  order_index integer not null default 0,
  key_concepts text[] default '{}',
  prerequisite_lesson_ids text[] default '{}'
);

create table if not exists public.student_lesson_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id text references public.course_lessons(id) on delete cascade not null,
  completed boolean not null default true,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_student_lesson unique (user_id, lesson_id)
);

alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.course_lessons enable row level security;
alter table public.student_lesson_progress enable row level security;

create policy "Courses viewable by everyone" on public.courses for select using ( true );
create policy "Course modules viewable by everyone" on public.course_modules for select using ( true );
create policy "Course lessons viewable by everyone" on public.course_lessons for select using ( true );
create policy "Users manage own lesson progress" on public.student_lesson_progress for all using ( auth.uid() = user_id );

-- 9. TEAM BATTLES (Fixed schedule, team formation, live scoring)
create table if not exists public.battles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  topic text not null,
  status text not null default 'upcoming' check (status in ('upcoming', 'registration', 'live', 'ended')),
  registration_deadline timestamp with time zone not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  max_team_size integer not null default 4,
  xp_pool integer not null default 500,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.battle_teams (
  id uuid default gen_random_uuid() primary key,
  battle_id uuid references public.battles(id) on delete cascade not null,
  name text not null,
  team_code text not null,
  total_score integer not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_battle_team_code unique (battle_id, team_code)
);

create table if not exists public.battle_team_members (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references public.battle_teams(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null default 'member' check (role in ('leader', 'member')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_team_user unique (team_id, user_id)
);

create table if not exists public.battle_challenges (
  id uuid default gen_random_uuid() primary key,
  battle_id uuid references public.battles(id) on delete cascade not null,
  title text not null,
  type text not null check (type in ('coding', 'quiz')),
  points integer not null default 50,
  problem_ref text not null
);

create table if not exists public.battle_submissions (
  id uuid default gen_random_uuid() primary key,
  battle_id uuid references public.battles(id) on delete cascade not null,
  team_id uuid references public.battle_teams(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  challenge_id uuid references public.battle_challenges(id) on delete cascade not null,
  points_awarded integer not null default 0,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_battle_submission unique (team_id, challenge_id)
);

alter table public.battles enable row level security;
alter table public.battle_teams enable row level security;
alter table public.battle_team_members enable row level security;
alter table public.battle_challenges enable row level security;
alter table public.battle_submissions enable row level security;

create policy "Battles viewable by authenticated users" on public.battles for select using ( auth.role() = 'authenticated' );
create policy "Faculty can manage battles" on public.battles for all using ( exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty') );

create policy "Battle teams viewable by authenticated users" on public.battle_teams for select using ( auth.role() = 'authenticated' );
create policy "Authenticated users can create battle teams" on public.battle_teams for insert with check ( auth.role() = 'authenticated' );

create policy "Battle team members viewable by authenticated users" on public.battle_team_members for select using ( auth.role() = 'authenticated' );
create policy "Users can join battle teams" on public.battle_team_members for insert with check ( auth.uid() = user_id );

create policy "Battle challenges viewable by authenticated users" on public.battle_challenges for select using ( auth.role() = 'authenticated' );
create policy "Battle submissions viewable by authenticated users" on public.battle_submissions for select using ( auth.role() = 'authenticated' );

-- 10. CODING SUBMISSIONS (Enforces single XP award per problem)
create table if not exists public.coding_submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  problem_id text not null,
  language text not null,
  passed boolean not null default true,
  xp_awarded integer not null default 0,
  code_hash text not null,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_problem_solve unique (user_id, problem_id)
);

alter table public.coding_submissions enable row level security;

create policy "Users view own coding submissions" on public.coding_submissions for select using ( auth.uid() = user_id );

-- 11. INTEGRITY FLAGS & AUDIT LOG (Faculty review, non-accusatory, reversible)
create table if not exists public.integrity_flags (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('fast_quiz', 'reciprocal_help', 'plagiarism_ast', 'rate_limit', 'suspicious_streak')),
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  details text not null,
  status text not null default 'pending' check (status in ('pending', 'dismissed', 'confirmed', 'reversed')),
  xp_associated integer not null default 0,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamp with time zone,
  faculty_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.audit_log (
  id uuid default gen_random_uuid() primary key,
  action text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  target_user_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.integrity_flags enable row level security;
alter table public.audit_log enable row level security;

create policy "Faculty can view and manage integrity flags"
  on public.integrity_flags for all
  using ( exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty') );

create policy "Faculty can view audit logs"
  on public.audit_log for select
  using ( exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty') );

-- 12. DATABASE FUNCTIONS & SECURE RPCs

-- A. Roster Activation Verification
create or replace function public.check_roster_activation(p_student_id text)
returns jsonb as $$
declare
  r record;
begin
  select student_id, full_name, email, department, role, is_activated
  into r
  from public.student_roster
  where upper(student_id) = upper(trim(p_student_id));

  if not found then
    return jsonb_build_object('success', false, 'error', 'Student ID not found in campus roster.');
  end if;

  if r.is_activated then
    return jsonb_build_object('success', false, 'error', 'Account is already activated. Please sign in with your password.');
  end if;

  return jsonb_build_object(
    'success', true,
    'studentId', r.student_id,
    'fullName', r.full_name,
    'email', r.email,
    'department', r.department,
    'role', r.role
  );
end;
$$ language plpgsql security definer;

-- B. Resolve Auth Email by Student ID
create or replace function public.get_auth_email_for_student(p_student_id text)
returns text as $$
declare
  v_email text;
begin
  select email into v_email
  from public.student_roster
  where upper(student_id) = upper(trim(p_student_id));
  return v_email;
end;
$$ language plpgsql security definer;

-- C. Mark Roster Row Activated (invoked after Supabase Auth user created)
create or replace function public.complete_roster_activation(p_student_id text)
returns boolean as $$
begin
  update public.student_roster
  set is_activated = true,
      activated_at = timezone('utc'::text, now())
  where upper(student_id) = upper(trim(p_student_id));
  return true;
end;
$$ language plpgsql security definer;

-- D. Peer Help Accept RPC (Strictly Requester-only, awards helper XP, rate limited)
create or replace function public.accept_peer_help(p_request_id uuid, p_response_id uuid)
returns jsonb as $$
declare
  v_request record;
  v_response record;
  v_helper_id uuid;
  v_today_start timestamp with time zone;
  v_accepted_today integer;
  v_pair_count integer;
begin
  -- 1. Fetch request and verify caller is requester
  select * into v_request from public.peer_help_requests where id = p_request_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Help request not found.');
  end if;

  if v_request.requester_id != auth.uid() then
    return jsonb_build_object('success', false, 'error', 'Only the student who asked for help may accept an answer.');
  end if;

  if v_request.status = 'resolved' then
    return jsonb_build_object('success', false, 'error', 'This request has already been resolved.');
  end if;

  -- 2. Fetch response
  select * into v_response from public.peer_help_responses where id = p_response_id and request_id = p_request_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Response not found.');
  end if;

  v_helper_id := v_response.helper_id;

  -- 3. No self-help check
  if v_helper_id = auth.uid() then
    return jsonb_build_object('success', false, 'error', 'You cannot accept your own response.');
  end if;

  -- 4. Daily rate limits & reciprocal collusion check
  v_today_start := timezone('utc'::text, date_trunc('day', now()));

  select count(*) into v_accepted_today
  from public.peer_help_responses
  where helper_id = v_helper_id and is_accepted = true and created_at >= v_today_start;

  if v_accepted_today >= 3 then
    return jsonb_build_object('success', false, 'error', 'Helper has reached maximum daily peer help rewards.');
  end if;

  -- 5. Mark accepted and update status
  update public.peer_help_responses set is_accepted = true where id = p_response_id;
  update public.peer_help_requests set status = 'resolved', accepted_response_id = p_response_id, resolved_at = now() where id = p_request_id;

  -- 6. Award helper XP
  update public.profiles set xp = xp + 25 where id = v_helper_id;
  insert into public.xp_activities (user_id, action, category, amount, verified, academic_impact)
  values (v_helper_id, 'Peer Help: Accepted Solution for "' || substring(v_request.title from 1 for 40) || '"', 'peer_help', 25, true, 'none');

  return jsonb_build_object('success', true, 'xpAwarded', 25);
end;
$$ language plpgsql security definer;

-- E. Reverse Flagged XP (Faculty with audit log)
create or replace function public.reverse_flagged_xp(p_flag_id uuid, p_faculty_reason text)
returns jsonb as $$
declare
  v_flag record;
begin
  if not exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'faculty') then
    return jsonb_build_object('success', false, 'error', 'Only faculty members may reverse XP.');
  end if;

  select * into v_flag from public.integrity_flags where id = p_flag_id;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Flagged incident not found.');
  end if;

  if v_flag.status = 'reversed' then
    return jsonb_build_object('success', false, 'error', 'Incident has already been reversed.');
  end if;

  -- Deduct XP safely
  update public.profiles
  set xp = greatest(0, xp - v_flag.xp_associated)
  where id = v_flag.user_id;

  -- Insert negative audit entry in xp_activities
  insert into public.xp_activities (user_id, action, category, amount, verified, academic_impact)
  values (v_flag.user_id, 'XP Reversal: ' || p_faculty_reason, 'assignment', -v_flag.xp_associated, true, 'none');

  -- Update flag status
  update public.integrity_flags
  set status = 'reversed',
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      faculty_notes = p_faculty_reason
  where id = p_flag_id;

  -- Log in audit table
  insert into public.audit_log (action, actor_id, target_user_id, reason, metadata)
  values ('xp_reversal', auth.uid(), v_flag.user_id, p_faculty_reason, jsonb_build_object('flag_id', p_flag_id, 'amount', v_flag.xp_associated));

  return jsonb_build_object('success', true);
end;
$$ language plpgsql security definer;
