import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { todayInZone } from '@/lib/format/date';
import { DailyLog } from '@/components/DailyLog';
import { dateParamSchema } from '@/lib/validation/daily-log.schema';

export default async function LogByDatePage({ params }) {
  const { date } = await params;

  if (!dateParamSchema.isValidSync(date)) {
    notFound();
  }

  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('sanctum_bell_timezone')
    .eq('id', user.id)
    .maybeSingle();

  const timezone = profile?.sanctum_bell_timezone ?? 'Asia/Manila';
  const today = todayInZone(timezone);

  if (date > today) {
    notFound();
  }

  return <DailyLog userId={user.id} logDate={date} today={today} />;
}
