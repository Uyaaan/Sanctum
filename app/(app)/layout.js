import { requireUser } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { todayInZone } from '@/lib/format/date';
import { AppShell } from '@/components/AppShell';
import { StreakBadge } from '@/components/StreakBadge';
import { QuickWin } from '@/components/QuickWin';

export default async function AppLayout({ children }) {
  const user = await requireUser();

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('sanctum_bell_timezone, display_name')
    .eq('id', user.id)
    .maybeSingle();

  const timezone = profile?.sanctum_bell_timezone ?? 'Asia/Manila';
  const today = todayInZone(timezone);
  const journalYear = today.slice(0, 4);
  const journalMonth = today.slice(5, 7);
  const journalHref = `/journal/${journalYear}/${journalMonth}`;

  return (
    <>
      <AppShell
        journalHref={journalHref}
        streakBadge={<StreakBadge userId={user.id} today={today} />}
      >
        {children}
      </AppShell>
      <QuickWin today={today} />
    </>
  );
}
