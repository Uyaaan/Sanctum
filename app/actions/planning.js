'use server';

import { requireUser } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { addDays, format, parseISO } from 'date-fns';

export async function getPlanningDataAction(today) {
  const user = await requireUser();
  const supabase = await createClient();

  const tomorrow = format(addDays(parseISO(today), 1), 'yyyy-MM-dd');
  const weekEnd = format(addDays(parseISO(today), 7), 'yyyy-MM-dd');
  const yesterday = format(addDays(parseISO(today), -1), 'yyyy-MM-dd');

  const [futureResult, yesterdayResult] = await Promise.all([
    supabase
      .from('daily_logs')
      .select('id, log_date, content_md, content, mode')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .gt('log_date', today)
      .lte('log_date', weekEnd)
      .order('log_date', { ascending: true }),
    supabase
      .from('daily_logs')
      .select('content')
      .eq('user_id', user.id)
      .eq('log_date', yesterday)
      .is('deleted_at', null)
      .maybeSingle(),
  ]);

  const futureEntries = (futureResult.data ?? []).filter(
    (e) =>
      (e.content_md && e.content_md.trim()) ||
      (e.content && Object.keys(e.content).some((k) => e.content[k])),
  );

  const yesterdayTomorrow = yesterdayResult.data?.content?.tomorrow ?? null;

  return { futureEntries, yesterdayTomorrow };
}
