import { createClient } from '@/lib/supabase/server';

const PER_TYPE_LIMIT = 20;

/**
 * Run a websearch-style query against daily_logs.search_tsv and accomplishments.search_tsv.
 * Returns { logs: [...], wins: [...] } sorted newest-first within each group.
 */
export async function searchAll(userId, query) {
  if (!query || !query.trim()) {
    return { logs: [], wins: [] };
  }

  const supabase = await createClient();

  const [logsResult, winsResult] = await Promise.all([
    supabase
      .from('daily_logs')
      .select('id, log_date, mode, content_md')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .textSearch('search_tsv', query, { type: 'websearch' })
      .order('log_date', { ascending: false })
      .limit(PER_TYPE_LIMIT),
    supabase
      .from('accomplishments')
      .select(
        `
        id, text, occurred_on, daily_log_id, created_at,
        accomplishment_tags (
          tags (id, name, slug, sigil_key)
        )
      `,
      )
      .eq('user_id', userId)
      .is('deleted_at', null)
      .textSearch('search_tsv', query, { type: 'websearch' })
      .order('occurred_on', { ascending: false })
      .limit(PER_TYPE_LIMIT),
  ]);

  return {
    logs: logsResult.data ?? [],
    wins: winsResult.data ?? [],
  };
}
