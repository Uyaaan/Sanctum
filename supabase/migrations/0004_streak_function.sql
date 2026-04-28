-- 0004_streak_function.sql
-- current_streak(user_id, today) — counts consecutive days with non-empty daily logs,
-- stepping backwards from `today`. Caller passes user-local "today" so a 11:55 PM log
-- doesn't fall off when the server's UTC midnight rolls past.
--
-- Empty auto-created entries don't count (content_md = '' AND content = '{}').

CREATE OR REPLACE FUNCTION public.current_streak(
  p_user_id uuid,
  p_today date DEFAULT (now() AT TIME ZONE 'utc')::date
)
RETURNS int
LANGUAGE plpgsql STABLE SECURITY INVOKER
AS $$
DECLARE
  v_streak int := 0;
  v_check_date date := p_today;
  v_exists boolean;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1
      FROM public.daily_logs
      WHERE user_id = p_user_id
        AND log_date = v_check_date
        AND deleted_at IS NULL
        AND (content_md <> '' OR content <> '{}'::jsonb)
    ) INTO v_exists;

    EXIT WHEN NOT v_exists;

    v_streak := v_streak + 1;
    v_check_date := v_check_date - 1;
  END LOOP;

  RETURN v_streak;
END;
$$;

GRANT EXECUTE ON FUNCTION public.current_streak(uuid, date) TO authenticated;
