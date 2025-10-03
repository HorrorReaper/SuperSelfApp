-- Migration: create tiny_habits table
CREATE TABLE IF NOT EXISTS tiny_habits (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  journey TEXT NOT NULL DEFAULT '30 Day Self Improvement Challenge',
  config JSONB,
  completions JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, journey)
);

-- Optional trigger to keep updated_at current (Postgres)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'tiny_habits_updated_at_trigger'
  ) THEN
    CREATE TRIGGER tiny_habits_updated_at_trigger
    BEFORE UPDATE ON tiny_habits
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
  END IF;
END$$;
