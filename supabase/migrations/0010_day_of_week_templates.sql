-- Day-of-week structured-mode templates (one row per weekday per user)
-- weekday: 0=Sun, 1=Mon, ..., 6=Sat

CREATE TABLE IF NOT EXISTS day_of_week_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weekday     smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  content     jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, weekday)
);

ALTER TABLE day_of_week_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select own templates"
  ON day_of_week_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "insert own templates"
  ON day_of_week_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update own templates"
  ON day_of_week_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "delete own templates"
  ON day_of_week_templates FOR DELETE
  USING (auth.uid() = user_id);
