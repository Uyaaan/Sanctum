-- 0002_core_tables.sql
-- Core tables: daily_logs, accomplishments, tags, joins, command center, audit.
-- RLS enabled BEFORE any insert. Standard 4-policy block on owned resources.

-- ============================================================================
-- daily_logs (date-keyed entries, structured-or-freeform mode)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date date NOT NULL,
  mode text NOT NULL DEFAULT 'structured' CHECK (mode IN ('structured', 'freeform')),
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_md text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  UNIQUE (user_id, log_date)
);

CREATE INDEX daily_logs_user_date_idx
  ON public.daily_logs (user_id, log_date DESC)
  WHERE deleted_at IS NULL;

CREATE TRIGGER daily_logs_updated_at
  BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_logs_select_own" ON public.daily_logs
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "daily_logs_insert_own" ON public.daily_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_logs_update_own" ON public.daily_logs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_logs_delete_own" ON public.daily_logs
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- accomplishments (wins; optional FK back to a daily_log)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.accomplishments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL CHECK (char_length(text) BETWEEN 1 AND 2000),
  occurred_on date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  daily_log_id uuid NULL REFERENCES public.daily_logs(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE INDEX accomplishments_user_date_idx
  ON public.accomplishments (user_id, occurred_on DESC)
  WHERE deleted_at IS NULL;

CREATE TRIGGER accomplishments_updated_at
  BEFORE UPDATE ON public.accomplishments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.accomplishments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accomplishments_select_own" ON public.accomplishments
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "accomplishments_insert_own" ON public.accomplishments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "accomplishments_update_own" ON public.accomplishments
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "accomplishments_delete_own" ON public.accomplishments
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- tags (sigils + future custom tags; sigil_key validated app-side)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  sigil_key text NULL,
  color text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  UNIQUE (user_id, slug)
);

CREATE INDEX tags_user_idx
  ON public.tags (user_id)
  WHERE deleted_at IS NULL;

CREATE TRIGGER tags_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tags_select_own" ON public.tags
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "tags_insert_own" ON public.tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tags_update_own" ON public.tags
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tags_delete_own" ON public.tags
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- entry_tags (M:M daily_log <-> tag, denormalized user_id for RLS perf)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.entry_tags (
  daily_log_id uuid NOT NULL REFERENCES public.daily_logs(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (daily_log_id, tag_id)
);

CREATE INDEX entry_tags_user_idx ON public.entry_tags (user_id);

ALTER TABLE public.entry_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entry_tags_select_own" ON public.entry_tags
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "entry_tags_insert_own" ON public.entry_tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "entry_tags_delete_own" ON public.entry_tags
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- accomplishment_tags (M:M accomplishment <-> tag)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.accomplishment_tags (
  accomplishment_id uuid NOT NULL REFERENCES public.accomplishments(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (accomplishment_id, tag_id)
);

CREATE INDEX accomplishment_tags_user_idx ON public.accomplishment_tags (user_id);

ALTER TABLE public.accomplishment_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accomplishment_tags_select_own" ON public.accomplishment_tags
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "accomplishment_tags_insert_own" ON public.accomplishment_tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "accomplishment_tags_delete_own" ON public.accomplishment_tags
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- quick_links (Command Center pinned URLs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.quick_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL CHECK (char_length(label) BETWEEN 1 AND 80),
  url text NOT NULL CHECK (url ~* '^https?://'),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE INDEX quick_links_user_sort_idx
  ON public.quick_links (user_id, sort_order)
  WHERE deleted_at IS NULL;

CREATE TRIGGER quick_links_updated_at
  BEFORE UPDATE ON public.quick_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.quick_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quick_links_select_own" ON public.quick_links
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "quick_links_insert_own" ON public.quick_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "quick_links_update_own" ON public.quick_links
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "quick_links_delete_own" ON public.quick_links
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- scratchpad (single plaintext blob per user)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.scratchpad (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER scratchpad_updated_at
  BEFORE UPDATE ON public.scratchpad
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.scratchpad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scratchpad_select_own" ON public.scratchpad
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "scratchpad_insert_own" ON public.scratchpad
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "scratchpad_update_own" ON public.scratchpad
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- todos (Command Center checklist)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL CHECK (char_length(text) BETWEEN 1 AND 500),
  is_done boolean NOT NULL DEFAULT false,
  done_at timestamptz NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE INDEX todos_user_active_idx
  ON public.todos (user_id, is_done, sort_order)
  WHERE deleted_at IS NULL;

CREATE TRIGGER todos_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todos_select_own" ON public.todos
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "todos_insert_own" ON public.todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "todos_update_own" ON public.todos
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "todos_delete_own" ON public.todos
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- audit_logs (deletes + auth events; SELECT-own only, INSERTs via service role)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NULL,
  resource_id uuid NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address inet NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_user_time_idx ON public.audit_logs (user_id, created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select_own" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);
-- No INSERT/UPDATE/DELETE policies — server actions write with the service role key.
