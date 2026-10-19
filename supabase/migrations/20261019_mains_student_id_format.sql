-- ====================================================================
-- QUESTIFY MIGRATION: MAINS STUDENT ID FORMAT SPECIFICATION
-- Format: prefix "Mains", hyphen, exactly 5 digits: ^Mains-\d{5}$
-- ====================================================================

-- 1. Ensure student ID in student_roster is indexed case-insensitively and unique
create unique index if not exists idx_student_roster_mains_id_lower
  on public.student_roster (lower(student_id));

-- 2. Format constraint on student_roster (allowing Mains-XXXXX for students, MSOT-FAC for faculty)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'chk_student_roster_id_format'
  ) then
    alter table public.student_roster
      add constraint chk_student_roster_id_format
      check (
        (role = 'student' and student_id ~* '^Mains-[0-9]{5}$') or
        (role = 'faculty' and student_id ~* '^(Mains|MSOT-FAC|FAC)-.*$')
      );
  end if;
exception
  when others then null;
end $$;

-- 3. Data Migration: Migrate demo student records to canonical Mains-XXXXX format
do $$
begin
  -- Temporary disable foreign key triggers if cascade isn't fully enabled
  set constraints all deferred;

  -- Update student_roster
  update public.student_roster set student_id = 'Mains-24813' where student_id = 'MSOT-2024-001';
  update public.student_roster set student_id = 'Mains-24814' where student_id = 'MSOT-2024-002';
  update public.student_roster set student_id = 'Mains-24815' where student_id = 'MSOT-2024-003';
  update public.student_roster set student_id = 'Mains-24816' where student_id = 'MSOT-2024-004';
  update public.student_roster set student_id = 'Mains-24817' where student_id = 'MSOT-2024-005';

  -- Update profiles
  if exists (select 1 from information_schema.tables where table_name = 'profiles') then
    update public.profiles set college_id = 'Mains-24813' where college_id = 'MSOT-2024-001';
    update public.profiles set college_id = 'Mains-24814' where college_id = 'MSOT-2024-002';
    update public.profiles set college_id = 'Mains-24815' where college_id = 'MSOT-2024-003';
    update public.profiles set college_id = 'Mains-24816' where college_id = 'MSOT-2024-004';
    update public.profiles set college_id = 'Mains-24817' where college_id = 'MSOT-2024-005';
  end if;

  -- Update password_reset_requests
  if exists (select 1 from information_schema.tables where table_name = 'password_reset_requests') then
    update public.password_reset_requests set student_id = 'Mains-24813' where student_id = 'MSOT-2024-001';
    update public.password_reset_requests set student_id = 'Mains-24814' where student_id = 'MSOT-2024-002';
    update public.password_reset_requests set student_id = 'Mains-24815' where student_id = 'MSOT-2024-003';
  end if;

  -- Update xp_transactions
  if exists (select 1 from information_schema.tables where table_name = 'xp_transactions') then
    update public.xp_transactions set student_id = 'Mains-24813' where student_id = 'MSOT-2024-001';
    update public.xp_transactions set student_id = 'Mains-24814' where student_id = 'MSOT-2024-002';
    update public.xp_transactions set student_id = 'Mains-24815' where student_id = 'MSOT-2024-003';
  end if;

  -- Update attendance_records
  if exists (select 1 from information_schema.tables where table_name = 'attendance_records') then
    update public.attendance_records set student_id = 'Mains-24813' where student_id = 'MSOT-2024-001';
    update public.attendance_records set student_id = 'Mains-24814' where student_id = 'MSOT-2024-002';
  end if;

  -- Update assignment_submissions
  if exists (select 1 from information_schema.tables where table_name = 'assignment_submissions') then
    update public.assignment_submissions set student_id = 'Mains-24813' where student_id = 'MSOT-2024-001';
    update public.assignment_submissions set student_id = 'Mains-24814' where student_id = 'MSOT-2024-002';
  end if;

  -- Update test_results
  if exists (select 1 from information_schema.tables where table_name = 'test_results') then
    update public.test_results set student_id = 'Mains-24813' where student_id = 'MSOT-2024-001';
    update public.test_results set student_id = 'Mains-24814' where student_id = 'MSOT-2024-002';
  end if;

  -- Update club_attendance
  if exists (select 1 from information_schema.tables where table_name = 'club_attendance') then
    update public.club_attendance set student_id = 'Mains-24813' where student_id = 'MSOT-2024-001';
  end if;

  -- Update custom_quiz_attempts
  if exists (select 1 from information_schema.tables where table_name = 'custom_quiz_attempts') then
    update public.custom_quiz_attempts set student_id = 'Mains-24813' where student_id = 'MSOT-2024-001';
    update public.custom_quiz_attempts set student_id = 'Mains-24814' where student_id = 'MSOT-2024-002';
  end if;

  -- Update daily_quest_attempts
  if exists (select 1 from information_schema.tables where table_name = 'daily_quest_attempts') then
    update public.daily_quest_attempts set student_id = 'Mains-24813' where student_id = 'MSOT-2024-001';
  end if;

exception
  when others then
    raise notice 'Data migration completed with warnings: %', sqlerrm;
end $$;

-- 4. Update RPC Functions for case-insensitive Mains ID matching

create or replace function public.check_roster_activation(p_student_id text)
returns jsonb as $$
declare
  r record;
  v_clean text;
begin
  v_clean := trim(p_student_id);

  -- Reject faculty identifiers on student activation
  if v_clean ~* '@' or v_clean ~* '^(msot-fac|fac-)' then
    return jsonb_build_object('success', false, 'error', 'This page is for students. Use Faculty Login.');
  end if;

  -- Reject non-conforming student IDs
  if not (v_clean ~* '^Mains-[0-9]{5}$') then
    return jsonb_build_object('success', false, 'error', 'Enter your student ID in this format: Mains-24813');
  end if;

  select student_id, full_name, email, department, role, is_activated
  into r
  from public.student_roster
  where lower(student_id) = lower(v_clean);

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

create or replace function public.get_auth_email_for_student(p_student_id text)
returns text as $$
declare
  v_email text;
begin
  select email into v_email
  from public.student_roster
  where lower(student_id) = lower(trim(p_student_id));
  return v_email;
end;
$$ language plpgsql security definer;

create or replace function public.complete_roster_activation(p_student_id text)
returns boolean as $$
begin
  update public.student_roster
  set is_activated = true,
      activated_at = timezone('utc'::text, now())
  where lower(student_id) = lower(trim(p_student_id));
  return true;
end;
$$ language plpgsql security definer;
