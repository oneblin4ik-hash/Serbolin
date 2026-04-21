-- Serbolin initial schema
-- Full RLS: пользователь видит и пишет только свои строки.

-- ============================================================================
-- TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  level integer NOT NULL DEFAULT 1,
  xp_current integer NOT NULL DEFAULT 0,
  xp_total integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  last_activity_date date,
  strength integer NOT NULL DEFAULT 1,
  endurance integer NOT NULL DEFAULT 1,
  discipline integer NOT NULL DEFAULT 1,
  energy integer NOT NULL DEFAULT 1,
  workout_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT player_stats_user_unique UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  date date NOT NULL,
  muscle_groups text[],
  exercises jsonb,
  notes text,
  recovery integer,
  xp_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS body_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  date date NOT NULL,
  weight decimal,
  chest decimal,
  waist decimal,
  hips decimal,
  thigh decimal,
  bicep decimal,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS body_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  target_weight decimal,
  target_chest decimal,
  target_waist decimal,
  target_hips decimal,
  target_thigh decimal,
  target_bicep decimal,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT body_goals_user_unique UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  date date NOT NULL,
  title text NOT NULL,
  xp_reward integer NOT NULL,
  branch text,
  is_custom boolean NOT NULL DEFAULT false,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bosses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  week_start date NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  xp_reward integer NOT NULL,
  progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bosses_user_week_unique UNIQUE (user_id, week_start)
);

CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  achievement_key text NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT achievements_user_key_unique UNIQUE (user_id, achievement_key)
);

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  contact text,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  source text,
  status text NOT NULL DEFAULT 'cold',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type text NOT NULL,
  amount decimal NOT NULL,
  category text,
  note text,
  date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title text NOT NULL,
  xp_reward integer NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS xp_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  amount integer NOT NULL,
  source text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  month date NOT NULL,
  reels integer NOT NULL DEFAULT 0,
  posts integer NOT NULL DEFAULT 0,
  subscribers integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_stats_user_month_unique UNIQUE (user_id, month)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS workouts_user_date_idx ON workouts (user_id, date DESC);
CREATE INDEX IF NOT EXISTS body_stats_user_date_idx ON body_stats (user_id, date DESC);
CREATE INDEX IF NOT EXISTS quests_user_date_idx ON quests (user_id, date DESC);
CREATE INDEX IF NOT EXISTS transactions_user_date_idx ON transactions (user_id, date DESC);
CREATE INDEX IF NOT EXISTS xp_log_user_created_idx ON xp_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS leads_user_status_idx ON leads (user_id, status);
CREATE INDEX IF NOT EXISTS clients_user_status_idx ON clients (user_id, status);
CREATE INDEX IF NOT EXISTS tasks_user_done_idx ON tasks (user_id, is_completed);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE player_stats   ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_stats     ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_goals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests         ENABLE ROW LEVEL SECURITY;
ALTER TABLE bosses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements   ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients        ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_log         ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_stats  ENABLE ROW LEVEL SECURITY;

-- Политики "owner only" на все таблицы.
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'player_stats','workouts','body_stats','body_goals','quests','bosses',
    'achievements','clients','leads','transactions','tasks','xp_log','content_stats'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', tbl || '_select', tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', tbl || '_insert', tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', tbl || '_update', tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', tbl || '_delete', tbl);

    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (auth.uid() = user_id)',
      tbl || '_select', tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR INSERT WITH CHECK (auth.uid() = user_id)',
      tbl || '_insert', tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)',
      tbl || '_update', tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR DELETE USING (auth.uid() = user_id)',
      tbl || '_delete', tbl
    );
  END LOOP;
END $$;
