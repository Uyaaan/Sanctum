import { createClient } from '@/lib/supabase/server';

export async function getScratchpad(userId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('scratchpad')
    .select('body, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ?? { body: '', updated_at: null };
}

export async function updateScratchpad({ userId, body }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('scratchpad')
    .upsert({ user_id: userId, body }, { onConflict: 'user_id' });
  if (error) throw error;
}
