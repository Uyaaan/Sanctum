import { createClient } from '@/lib/supabase/server';

export async function listTodos(userId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('todos')
    .select('id, text, is_done, done_at, sort_order')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('is_done', { ascending: true })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createTodo({ userId, text }) {
  const supabase = await createClient();

  const { data: maxRow } = await supabase
    .from('todos')
    .select('sort_order')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSort = (maxRow?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from('todos')
    .insert({ user_id: userId, text, sort_order: nextSort })
    .select('id, text, is_done, done_at, sort_order')
    .single();

  if (error) throw error;
  return data;
}

export async function updateTodo({ userId, id, text }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('todos')
    .update({ text })
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function toggleTodo({ userId, id, isDone }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('todos')
    .update({
      is_done: isDone,
      done_at: isDone ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function deleteTodo({ userId, id }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('todos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function reorderTodos({ userId, orderedIds }) {
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from('todos')
        .update({ sort_order: index + 1 })
        .eq('id', id)
        .eq('user_id', userId),
    ),
  );
}
