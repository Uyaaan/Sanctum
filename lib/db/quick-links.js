import { createClient } from '@/lib/supabase/server';

export async function listQuickLinks(userId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('quick_links')
    .select('id, label, url, sort_order')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createQuickLink({ userId, label, url }) {
  const supabase = await createClient();

  const { data: maxRow } = await supabase
    .from('quick_links')
    .select('sort_order')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSort = (maxRow?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from('quick_links')
    .insert({ user_id: userId, label, url, sort_order: nextSort })
    .select('id, label, url, sort_order')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteQuickLink({ userId, id }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('quick_links')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}
