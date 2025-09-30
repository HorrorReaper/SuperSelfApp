-- Migration: create challenge_days table and streak functions
-- 1) create table to store per-user challenge day rows
CREATE TABLE IF NOT EXISTS public.challenge_days (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL,
  day_number integer NOT NULL,
  date_iso date NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  credited_to_streak boolean DEFAULT true,
  habit_minutes integer DEFAULT 0,
  sessions jsonb DEFAULT '[]'::jsonb,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_challenge_days_user_day ON public.challenge_days (user_id, day_number);
CREATE INDEX IF NOT EXISTS idx_challenge_days_user_date ON public.challenge_days (user_id, date_iso);

-- Function: compute streak starting from day 1 (matches existing client semantics)
CREATE OR REPLACE FUNCTION public.compute_streak_from_start(p_user uuid)
RETURNS integer LANGUAGE plpgsql STABLE AS $$
DECLARE
  rec RECORD;
  cnt INTEGER := 0;
BEGIN
  FOR rec IN
    SELECT day_number, completed, credited_to_streak
    FROM public.challenge_days
    WHERE user_id = p_user
    ORDER BY day_number ASC
  LOOP
    IF NOT coalesce(rec.completed, false) THEN
      EXIT;
    END IF;
    IF rec.credited_to_streak IS NOT NULL AND rec.credited_to_streak = false THEN
      EXIT;
    END IF;
    cnt := cnt + 1;
  END LOOP;
  RETURN cnt;
END;
$$;

-- Convenience RPC: get current user's streak (uses auth.uid())
CREATE OR REPLACE FUNCTION public.get_my_streak()
RETURNS integer LANGUAGE plpgsql STABLE AS $$
DECLARE u uuid := auth.uid();
BEGIN
  IF u IS NULL THEN
    RETURN 0;
  END IF;
  RETURN public.compute_streak_from_start(u);
END;
$$;
