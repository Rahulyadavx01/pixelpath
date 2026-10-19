-- ====================================================================
-- QUESTIFY SUPABASE DATABASE SCHEMA
-- MSOT Gamified Learning Challenge
-- ====================================================================

-- 1. PROFILES TABLE (Linked to Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text not null,
  avatar_url text,
  college_id text,
  major text default 'Computer Science & Engineering',
  semester text default 'Semester 4',
  level integer default 1,
  xp integer default 0,
  xp_to_next_level integer default 1000,
  streak_days integer default 0,
  streak_freeze_count integer default 2,
  league text default 'Bronze',
  class_rank integer default 1,
  is_anonymous boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- 2. XP ACTIVITIES AUDIT LEDGER
create table if not exists public.xp_activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  action text not null,
  category text not null check (category in ('attendance', 'quiz', 'assignment', 'coding', 'peer_help', 'streak_bonus', 'league')),
  amount integer not null,
  verified boolean default true,
  academic_impact text default 'none',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.xp_activities enable row level security;

create policy "Users can view own XP history."
  on public.xp_activities for select
  using ( auth.uid() = user_id );

create policy "Users can insert verified XP."
  on public.xp_activities for insert
  with check ( auth.uid() = user_id );

-- 3. QUESTS TABLE
create table if not exists public.quests (
  id text primary key,
  title text not null,
  description text not null,
  category text not null,
  xp_reward integer not null,
  max_progress integer default 1,
  icon_name text default 'Zap',
  cta_text text default 'Start',
  cta_route text default '/dashboard'
);

alter table public.quests enable row level security;
create policy "Quests are viewable by everyone." on public.quests for select using ( true );

-- 4. USER QUEST PROGRESS
create table if not exists public.user_quests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  quest_id text references public.quests(id) on delete cascade not null,
  progress integer default 0,
  completed boolean default false,
  claimed boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, quest_id)
);

alter table public.user_quests enable row level security;
create policy "Users manage own quest progress." on public.user_quests for all using ( auth.uid() = user_id );

-- 5. REWARDS STORE CATALOG
create table if not exists public.rewards (
  id text primary key,
  title text not null,
  category text not null,
  xp_cost integer not null,
  image text not null,
  description text not null,
  stock integer default 10,
  msot_approved boolean default true,
  sponsor text default 'MSOT Student Life'
);

alter table public.rewards enable row level security;
create policy "Rewards catalogue viewable by everyone." on public.rewards for select using ( true );

-- 6. REWARD REDEMPTIONS
create table if not exists public.reward_redemptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reward_id text references public.rewards(id) on delete cascade not null,
  redeemed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'claimed' check (status in ('claimed', 'fulfilled', 'voided'))
);

alter table public.reward_redemptions enable row level security;
create policy "Users can view own redemptions." on public.reward_redemptions for all using ( auth.uid() = user_id );

-- 7. COMMUNITY POSTS & REPLIES
create table if not exists public.community_posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  body text not null,
  category text not null,
  tags text[] default '{}',
  upvotes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.community_posts enable row level security;
create policy "Community posts viewable by everyone." on public.community_posts for select using ( true );
create policy "Users can insert community posts." on public.community_posts for insert with check ( auth.uid() = author_id );

create table if not exists public.community_replies (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.community_posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  upvotes integer default 0,
  is_accepted boolean default false,
  xp_awarded integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.community_replies enable row level security;
create policy "Community replies viewable by everyone." on public.community_replies for select using ( true );
create policy "Users can insert community replies." on public.community_replies for insert with check ( auth.uid() = author_id );

-- 8. TRIGGER: Create public.profile on auth.user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url, college_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'),
    'MSOT-' || upper(substring(md5(random()::text) from 1 for 8))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
