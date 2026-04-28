-- 0006_seed_tags_trigger.sql
-- Expand handle_new_user: also create scratchpad row + 4 default sigil tags
-- (Breakthrough, Persistence, Learned, HelpedSomeone) for new users.
-- Backfill the same data for the already-signed-in user.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.scratchpad (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.tags (user_id, name, slug, sigil_key) VALUES
    (NEW.id, 'Breakthrough',    'breakthrough',    'breakthrough'),
    (NEW.id, 'Persistence',     'persistence',     'persistence'),
    (NEW.id, 'Learned',         'learned',         'learned'),
    (NEW.id, 'Helped Someone',  'helped_someone',  'helped_someone')
  ON CONFLICT (user_id, slug) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Re-revoke after CREATE OR REPLACE (which restores default PUBLIC EXECUTE)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- Backfill existing users (idempotent via ON CONFLICT)
DO $$
DECLARE
  v_user record;
BEGIN
  FOR v_user IN SELECT id FROM auth.users LOOP
    INSERT INTO public.scratchpad (user_id) VALUES (v_user.id) ON CONFLICT (user_id) DO NOTHING;
    INSERT INTO public.tags (user_id, name, slug, sigil_key) VALUES
      (v_user.id, 'Breakthrough',    'breakthrough',    'breakthrough'),
      (v_user.id, 'Persistence',     'persistence',     'persistence'),
      (v_user.id, 'Learned',         'learned',         'learned'),
      (v_user.id, 'Helped Someone',  'helped_someone',  'helped_someone')
    ON CONFLICT (user_id, slug) DO NOTHING;
  END LOOP;
END $$;
