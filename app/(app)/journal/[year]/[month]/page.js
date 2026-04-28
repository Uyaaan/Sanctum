import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { todayInZone } from '@/lib/format/date';
import { yearMonthSchema } from '@/lib/validation/month-params.schema';
import { MonthBrowser } from '@/components/MonthBrowser';
import { MonthSummary } from '@/components/MonthSummary';

export default async function MonthlyJournalPage({ params }) {
  const { year: yearStr, month: monthStr } = await params;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  try {
    yearMonthSchema.validateSync({ year, month });
  } catch {
    notFound();
  }

  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: profile }, { data: summary, error: summaryError }] = await Promise.all([
    supabase.from('profiles').select('sanctum_bell_timezone').eq('id', user.id).maybeSingle(),
    supabase.rpc('month_summary', {
      p_user_id: user.id,
      p_year: year,
      p_month: month,
    }),
  ]);

  const timezone = profile?.sanctum_bell_timezone ?? 'Asia/Manila';
  const today = todayInZone(timezone);

  return (
    <section className="space-y-6">
      <MonthBrowser year={year} month={month} today={today} />
      {summaryError ? (
        <p className="text-danger text-sm">Couldn&apos;t generate the summary. Try again.</p>
      ) : (
        <MonthSummary summary={summary} />
      )}
    </section>
  );
}
