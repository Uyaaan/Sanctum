-- Image attachments for daily logs
-- Storage bucket 'daily-log-images' must be created separately in the Supabase dashboard
-- with RLS policy: authenticated users can read/write only their own folder (user_id/)

CREATE TABLE IF NOT EXISTS image_attachments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_log_id  uuid NULL REFERENCES daily_logs(id) ON DELETE SET NULL,
  storage_path  text NOT NULL,
  alt_text      text,
  width         int,
  height        int,
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

ALTER TABLE image_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select own image attachments"
  ON image_attachments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "insert own image attachments"
  ON image_attachments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update own image attachments"
  ON image_attachments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "delete own image attachments"
  ON image_attachments FOR DELETE
  USING (auth.uid() = user_id);
