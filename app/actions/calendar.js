'use server';

import { requireUser } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';

export async function getCalendarActivityAction(startDate, endDate) {
  const user = await requireUser();
  const supabase = await createClient();

  const [logsResult, winsResult] = await Promise.all([
    supabase
      .from('daily_logs')
      .select('log_date')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .gte('log_date', startDate)
      .lte('log_date', endDate),
    supabase
      .from('accomplishments')
      .select('occurred_on')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .gte('occurred_on', startDate)
      .lte('occurred_on', endDate),
  ]);

  return {
    logDates: (logsResult.data ?? []).map((r) => r.log_date),
    winDates: (winsResult.data ?? []).map((r) => r.occurred_on),
  };
}
