import { createClient } from '@/lib/supabase/server';

/**
 * Fetch the daily log for a given user/date. Returns null if missing.
 * RLS enforces the user_id match.
 */
export async function getDailyLog(userId, logDate) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', logDate)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Get-or-create today's daily log. Auto-creates an empty row if missing,
 * so the editor always has something to edit (and the streak query can
 * tell empty from non-existent via the content emptiness check).
 */
export async function deleteDailyLog({ userId, id }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('daily_logs')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function getOrCreateDailyLog(userId, logDate) {
  const existing = await getDailyLog(userId, logDate);
  if (existing) return existing;

  const supabase = await createClient();
  const { data: created, error } = await supabase
    .from('daily_logs')
    .insert({ user_id: userId, log_date: logDate })
    .select()
    .single();

  if (error) throw error;
  return created;
}
