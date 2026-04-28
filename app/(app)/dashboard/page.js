import { requireUser } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { todayInZone } from '@/lib/format/date';
import { DailyLog } from '@/components/DailyLog';
import { RuneDivider } from '@/components/RuneDivider';

export default async function DashboardPage() {
  const user = await requireUser();

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('sanctum_bell_timezone, display_name')
    .eq('id', user.id)
    .maybeSingle();

  const timezone = profile?.sanctum_bell_timezone ?? 'Asia/Manila';
  const today = todayInZone(timezone);

  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <header className="flex items-center justify-between gap-4">
          <h1 className="font-display text-amber text-3xl font-semibold tracking-wide">Sanctum</h1>
          <span className="text-text-subtle hidden text-sm sm:inline">
            {profile?.display_name ?? user.email}
          </span>
        </header>

        <RuneDivider />

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <DailyLog userId={user.id} logDate={today} />
          <aside
            aria-label="Command Center"
            className="border-border bg-surface/40 h-fit rounded border p-4"
          >
            <h2 className="font-display text-rune-gold text-xs tracking-[0.2em] uppercase">
              Command Center
            </h2>
            <p className="text-text-subtle mt-2 text-xs">
              Quick links, scratchpad, and todos arrive in Day 5.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
