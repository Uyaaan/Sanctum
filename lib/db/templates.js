import { createClient } from '@/lib/supabase/server';

export async function listTemplates(userId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('day_of_week_templates')
    .select('id, weekday, content')
    .eq('user_id', userId)
    .order('weekday', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function upsertTemplate({ userId, weekday, content }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('day_of_week_templates')
    .upsert(
      { user_id: userId, weekday, content, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,weekday' },
    );
  if (error) throw error;
}
