import { requireUser } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { todayInZone } from '@/lib/format/date';
import { DailyLog } from '@/components/DailyLog';
import { HeatmapCalendar } from '@/components/HeatmapCalendar';
import { CommandCenter } from '@/components/CommandCenter';
import { PlanningPanel } from '@/components/PlanningPanel';
import { OnThisDayRibbon } from '@/components/OnThisDayRibbon';
import { getPlanningDataAction } from '@/app/actions/planning';
import { getOnThisDayAction } from '@/app/actions/on-this-day';

export default async function DashboardPage() {
  const user = await requireUser();

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('sanctum_bell_timezone')
    .eq('id', user.id)
    .maybeSingle();

  const timezone = profile?.sanctum_bell_timezone ?? 'Asia/Manila';
  const today = todayInZone(timezone);

  const [{ futureEntries, yesterdayTomorrow }, onThisDay] = await Promise.all([
    getPlanningDataAction(today),
    getOnThisDayAction(today),
  ]);

  return (
    <div className="space-y-6">
      <HeatmapCalendar userId={user.id} today={today} />
      <OnThisDayRibbon entries={onThisDay} />
      <PlanningPanel futureEntries={futureEntries} yesterdayTomorrow={yesterdayTomorrow} />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <DailyLog userId={user.id} logDate={today} today={today} />
        <div className="h-fit">
          <CommandCenter userId={user.id} />
        </div>
      </div>
    </div>
  );
}
