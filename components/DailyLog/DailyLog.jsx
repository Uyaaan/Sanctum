import { getOrCreateDailyLog } from '@/lib/db/daily-logs';
import { ErrorState } from '@/components/ErrorState';
import { DailyLogEditor } from './DailyLogEditor';

export async function DailyLog({ userId, logDate }) {
  let log;
  try {
    log = await getOrCreateDailyLog(userId, logDate);
  } catch {
    return (
      <ErrorState title="Couldn't load today's entry" description="Try refreshing the page." />
    );
  }

  return <DailyLogEditor initialLog={log} />;
}
