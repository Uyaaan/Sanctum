import Link from 'next/link';
import { requireUser } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { todayInZone } from '@/lib/format/date';
import { RuneDivider } from '@/components/RuneDivider';
import { QuickWin } from '@/components/QuickWin';
import { StreakBadge } from '@/components/StreakBadge';

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

  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8 pb-24">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="font-display text-amber hover:text-amber/90 text-3xl font-semibold tracking-wide transition-colors"
          >
            Sanctum
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-3 sm:gap-4">
            <StreakBadge userId={user.id} today={today} />
            <Link
              href={`/journal/${journalYear}/${journalMonth}`}
              className="text-text-muted hover:text-amber text-sm transition-colors"
            >
              Journal
            </Link>
            <Link
              href="/search"
              className="text-text-muted hover:text-amber text-sm transition-colors"
            >
              Search
            </Link>
            <Link
              href="/wins"
              className="text-text-muted hover:text-amber text-sm transition-colors"
            >
              Wins
            </Link>
            <Link
              href="/settings"
              className="text-text-muted hover:text-amber text-sm transition-colors"
              aria-label="Settings"
            >
              Settings
            </Link>
            <span className="text-text-subtle hidden text-sm sm:inline">
              {profile?.display_name ?? user.email}
            </span>
          </nav>
        </header>

        <RuneDivider />

        {children}
      </div>
      <QuickWin today={today} />
    </main>
  );
}
