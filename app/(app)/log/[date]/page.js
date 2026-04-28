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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <DailyLog userId={user.id} logDate={date} today={today} />
      <aside
        aria-label="Command Center"
        className="border-border bg-surface/40 h-fit rounded border p-4"
      >
        <h2 className="font-display text-rune-gold text-xs tracking-[0.2em] uppercase">
          Command Center
        </h2>
        <p className="text-text-subtle mt-2 text-xs">
          Time-traveling. Today&apos;s entry: edit there.
        </p>
      </aside>
    </div>
  );
}
