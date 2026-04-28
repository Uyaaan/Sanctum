-- 0007_month_summary_function.sql
-- month_summary(user_id, year, month) returns a JSONB blob covering the requested month:
--   month_label, year, month, entry_count, win_count, longest_streak_in_month,
--   top_tags (top 5), weeks (entries grouped by week with previews), wins (with sigil keys).
-- Empty/auto-created daily logs (content_md = '' AND content = '{}') are excluded from counts.

CREATE OR REPLACE FUNCTION public.month_summary(
  p_user_id uuid,
  p_year int,
  p_month int
)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public, pg_catalog
AS $$
DECLARE
  v_start date := make_date(p_year, p_month, 1);
  v_end date := (v_start + interval '1 month')::date;
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'month_label', to_char(v_start, 'FMMonth YYYY'),
    'year', p_year,
    'month', p_month,
    'entry_count', (
      SELECT count(*)::int FROM public.daily_logs
      WHERE user_id = p_user_id AND log_date >= v_start AND log_date < v_end
        AND deleted_at IS NULL
        AND (content_md <> '' OR content <> '{}'::jsonb)
    ),
    'win_count', (
      SELECT count(*)::int FROM public.accomplishments
      WHERE user_id = p_user_id AND occurred_on >= v_start AND occurred_on < v_end
        AND deleted_at IS NULL
    ),
    'longest_streak_in_month', (
      WITH days AS (
        SELECT log_date FROM public.daily_logs
        WHERE user_id = p_user_id AND log_date >= v_start AND log_date < v_end
          AND deleted_at IS NULL AND (content_md <> '' OR content <> '{}'::jsonb)
        ORDER BY log_date
      ),
      grouped AS (
        SELECT log_date,
          log_date - (row_number() OVER (ORDER BY log_date))::int AS grp
        FROM days
      )
      SELECT COALESCE(MAX(streak), 0)::int FROM (
        SELECT count(*) AS streak FROM grouped GROUP BY grp
      ) s
    ),
    'top_tags', COALESCE((
      SELECT jsonb_agg(t.* ORDER BY t.cnt DESC) FROM (
        SELECT tg.name, tg.slug, tg.sigil_key, count(*)::int AS cnt
        FROM public.accomplishment_tags at
        JOIN public.tags tg ON tg.id = at.tag_id
        JOIN public.accomplishments a ON a.id = at.accomplishment_id
        WHERE at.user_id = p_user_id
          AND a.occurred_on >= v_start AND a.occurred_on < v_end
          AND a.deleted_at IS NULL
        GROUP BY tg.id, tg.name, tg.slug, tg.sigil_key
        ORDER BY cnt DESC
        LIMIT 5
      ) t
    ), '[]'::jsonb),
    'weeks', COALESCE((
      SELECT jsonb_agg(w ORDER BY w.week_start) FROM (
        SELECT
          date_trunc('week', log_date)::date AS week_start,
          jsonb_agg(
            jsonb_build_object(
              'date', log_date,
              'mode', mode,
              'preview', LEFT(content_md, 240)
            )
            ORDER BY log_date
          ) AS entries
        FROM public.daily_logs
        WHERE user_id = p_user_id AND log_date >= v_start AND log_date < v_end
          AND deleted_at IS NULL AND (content_md <> '' OR content <> '{}'::jsonb)
        GROUP BY 1
      ) w
    ), '[]'::jsonb),
    'wins', COALESCE((
      SELECT jsonb_agg(w ORDER BY w.occurred_on) FROM (
        SELECT
          a.id,
          a.text,
          a.occurred_on,
          COALESCE(
            jsonb_agg(t.sigil_key) FILTER (WHERE t.sigil_key IS NOT NULL),
            '[]'::jsonb
          ) AS sigil_keys
        FROM public.accomplishments a
        LEFT JOIN public.accomplishment_tags at ON at.accomplishment_id = a.id
        LEFT JOIN public.tags t ON t.id = at.tag_id
        WHERE a.user_id = p_user_id
          AND a.occurred_on >= v_start AND a.occurred_on < v_end
          AND a.deleted_at IS NULL
        GROUP BY a.id, a.text, a.occurred_on
      ) w
    ), '[]'::jsonb)
  ) INTO v_result;
  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.month_summary(uuid, int, int) TO authenticated;
