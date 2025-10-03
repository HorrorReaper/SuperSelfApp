-- Migration: seed example tiny_habits rows
-- This file provides example inserts for the `tiny_habits` table created in 0001_create_tiny_habits.sql
-- It is idempotent (uses ON CONFLICT) and includes two approaches:
--  A) Direct insert with a placeholder UUID (replace <USER_UUID> before running)
--  B) Insert by looking up a user in `profiles` by email (adjust email to match an existing profile)

-- Example A: direct insert (replace <USER_UUID> with a real uuid from your `profiles` table)
INSERT INTO tiny_habits (user_id, journey, config, completions, created_at, updated_at)
VALUES (
  '<USER_UUID>',
  '30 Day Self Improvement Challenge',
  '{"type": "timeboxing", "active": true, "startedOnDay": 1}'::jsonb,
  '[]'::jsonb,
  now(), now()
)
ON CONFLICT (user_id, journey) DO UPDATE
  SET config = EXCLUDED.config,
      completions = EXCLUDED.completions,
      updated_at = now();

-- Example B: insert for a profile found by email (change email to match an existing profile)
INSERT INTO tiny_habits (user_id, journey, config, completions, created_at, updated_at)
SELECT p.id, '30 Day Self Improvement Challenge',
  '{"type":"mobility","active":true,"startedOnDay":3}'::jsonb,
  ('[{"day":3,"done":true}]')::jsonb,
  now(), now()
FROM profiles p
WHERE p.email = 'demo@example.com'
ON CONFLICT (user_id, journey) DO UPDATE
  SET config = EXCLUDED.config,
      completions = EXCLUDED.completions,
      updated_at = now();

-- Example C: seed a couple of demo users with fixed placeholder UUIDs
-- Replace these UUIDs with real profile IDs or remove if not wanted.
INSERT INTO tiny_habits (user_id, journey, config, completions, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', '30 Day Self Improvement Challenge', '{"type":"lights_down","active":true,"startedOnDay":5}'::jsonb, '[]'::jsonb, now(), now()),
  ('22222222-2222-2222-2222-222222222222', '30 Day Self Improvement Challenge', '{"type":"timeboxing","active":true,"startedOnDay":2}'::jsonb, ('[{"day":2,"done":true},{"day":3,"done":false}]')::jsonb, now(), now())
ON CONFLICT (user_id, journey) DO UPDATE
  SET config = EXCLUDED.config,
      completions = EXCLUDED.completions,
      updated_at = now();

-- End of seed migration. Edit/remove placeholder UUIDs and the email used above as appropriate before running.
