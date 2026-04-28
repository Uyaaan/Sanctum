import { createClient } from '@/lib/supabase/server';

/**
 * Create an accomplishment + optionally tag it with a sigil.
 * Returns the created row.
 */
export async function createAccomplishment({ userId, text, sigilKey, occurredOn }) {
  const supabase = await createClient();

  const { data: win, error: insertError } = await supabase
    .from('accomplishments')
    .insert({ user_id: userId, text, occurred_on: occurredOn })
    .select()
    .single();

  if (insertError) throw insertError;

  if (sigilKey) {
    const { data: tag } = await supabase
      .from('tags')
      .select('id')
      .eq('user_id', userId)
      .eq('sigil_key', sigilKey)
      .is('deleted_at', null)
      .maybeSingle();

    if (tag) {
      await supabase.from('accomplishment_tags').insert({
        accomplishment_id: win.id,
        tag_id: tag.id,
        user_id: userId,
      });
    }
  }

  return win;
}

/**
 * List accomplishments for a user, newest first.
 * If sigilKey is provided, only wins tagged with that sigil are returned.
 */
export async function listAccomplishments({ userId, sigilKey = null, limit = 100 }) {
  const supabase = await createClient();

  if (sigilKey) {
    const { data, error } = await supabase
      .from('accomplishments')
      .select(
        `
        id, text, occurred_on, daily_log_id, created_at,
        accomplishment_tags!inner (
          tags!inner (id, name, slug, sigil_key)
        )
      `,
      )
      .eq('user_id', userId)
      .is('deleted_at', null)
      .eq('accomplishment_tags.tags.sigil_key', sigilKey)
      .order('occurred_on', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data ?? [];
  }

  const { data, error } = await supabase
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
    .order('occurred_on', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
