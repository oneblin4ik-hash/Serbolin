-- SSS v2 schema — run in Supabase SQL Editor
-- All tables prefixed with v2_ to avoid conflicts with Flutter app tables

-- ─── Player stats ─────────────────────────────────────────────────────────────
create table if not exists v2_player_stats (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid unique references auth.users(id) on delete cascade,
  name            text not null default 'Эдуард',
  avatar_url      text,
  total_xp        integer not null default 0,
  stats           jsonb not null default '{"strength":0,"discipline":0,"energy":0,"endurance":0}',
  streak_days     integer not null default 0,
  last_quest_day  text,
  updated_at      timestamptz default now()
);
alter table v2_player_stats enable row level security;
create policy "Own stats" on v2_player_stats for all using (auth.uid() = user_id);

-- ─── Quests ───────────────────────────────────────────────────────────────────
create table if not exists v2_quests (
  id           text primary key,
  user_id      uuid references auth.users(id) on delete cascade,
  branch       text,
  title        text not null,
  xp           integer default 30,
  difficulty   text,
  is_custom    boolean default false,
  date_key     text,
  completed_at bigint,
  created_at   timestamptz default now()
);
alter table v2_quests enable row level security;
create policy "Own quests" on v2_quests for all using (auth.uid() = user_id);
create index if not exists v2_quests_user_date on v2_quests(user_id, date_key);

-- ─── Tasks ────────────────────────────────────────────────────────────────────
create table if not exists v2_tasks (
  id           text primary key,
  user_id      uuid references auth.users(id) on delete cascade,
  title        text not null,
  note         text,
  xp           integer default 20,
  stat_key     text default 'discipline',
  recurring    text,
  completed_at bigint,
  created_at   bigint
);
alter table v2_tasks enable row level security;
create policy "Own tasks" on v2_tasks for all using (auth.uid() = user_id);

-- ─── Achievements ─────────────────────────────────────────────────────────────
create table if not exists v2_achievements (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade,
  achievement_key text not null,
  unlocked_at     timestamptz default now(),
  unique(user_id, achievement_key)
);
alter table v2_achievements enable row level security;
create policy "Own achievements" on v2_achievements for all using (auth.uid() = user_id);

-- ─── Content posts ────────────────────────────────────────────────────────────
create table if not exists v2_content_posts (
  id         text primary key,
  user_id    uuid references auth.users(id) on delete cascade,
  date       text not null,
  platform   text not null,
  format     text not null,
  title      text,
  body       text,
  status     text default 'idea',
  xp_earned  boolean default false,
  created_at bigint
);
alter table v2_content_posts enable row level security;
create policy "Own content" on v2_content_posts for all using (auth.uid() = user_id);
create index if not exists v2_content_user_date on v2_content_posts(user_id, date);

-- ─── Workouts ─────────────────────────────────────────────────────────────────
create table if not exists v2_workouts (
  id            text primary key,
  user_id       uuid references auth.users(id) on delete cascade,
  date          text not null,
  title         text not null,
  muscle_groups jsonb default '[]',
  exercises     jsonb default '[]',
  xp            integer default 50,
  note          text,
  created_at    bigint
);
alter table v2_workouts enable row level security;
create policy "Own workouts" on v2_workouts for all using (auth.uid() = user_id);
create index if not exists v2_workouts_user_date on v2_workouts(user_id, date);

-- ─── Body measurements ────────────────────────────────────────────────────────
create table if not exists v2_body_measurements (
  id         text primary key,
  user_id    uuid references auth.users(id) on delete cascade,
  date       text not null,
  weight     numeric,
  chest      numeric,
  waist      numeric,
  hip        numeric,
  thigh      numeric,
  bicep      numeric,
  note       text,
  created_at bigint
);
alter table v2_body_measurements enable row level security;
create policy "Own measurements" on v2_body_measurements for all using (auth.uid() = user_id);
create index if not exists v2_body_user_date on v2_body_measurements(user_id, date);

-- ─── Projects ─────────────────────────────────────────────────────────────────
create table if not exists v2_projects (
  id          text primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  title       text not null,
  description text,
  status      text default 'active',
  progress    integer default 0,
  deadline    text,
  tags        jsonb default '[]',
  created_at  bigint
);
alter table v2_projects enable row level security;
create policy "Own projects" on v2_projects for all using (auth.uid() = user_id);

-- ─── CRM clients (Личная база) ────────────────────────────────────────────────
create table if not exists v2_crm_clients (
  id             text primary key,
  user_id        uuid references auth.users(id) on delete cascade,
  name           text not null,
  phone          text,
  telegram       text,
  city           text,
  goal           text,
  level          text,
  monthly_amount numeric,
  note           text,
  payments       jsonb default '[]',
  created_at     bigint
);
alter table v2_crm_clients enable row level security;
create policy "Own clients" on v2_crm_clients for all using (auth.uid() = user_id);
