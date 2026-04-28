'use server';

import { requireUser } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { addYears, format, parseISO } from 'date-fns';

const INTERVALS = [1, 2, 3, 5]; // years back to check

export async function getOnThisDayAction(today) {
  const user = await requireUser();
  const supabase = await createClient();

  const dates = INTERVALS.map((n) => format(addYears(parseISO(today), -n), 'yyyy-MM-dd'));

  const { data } = await supabase
    .from('daily_logs')
    .select('id, log_date, content_md, content')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .in('log_date', dates);

  const entries = (data ?? []).filter(
    (e) =>
      (e.content_md && e.content_md.trim()) ||
      (e.content && Object.values(e.content).some(Boolean)),
  );

  return entries.map((e) => ({
    id: e.id,
    log_date: e.log_date,
    preview: (e.content_md || Object.values(e.content ?? {}).join(' ')).slice(0, 140),
    yearsAgo: parseInt(today.slice(0, 4)) - parseInt(e.log_date.slice(0, 4)),
  }));
}
