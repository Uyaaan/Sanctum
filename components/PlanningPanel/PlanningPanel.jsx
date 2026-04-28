import Link from 'next/link';
import { formatLogDate } from '@/lib/format/date';

export function PlanningPanel({ futureEntries, yesterdayTomorrow }) {
  const hasAnything = futureEntries.length > 0 || yesterdayTomorrow;
  if (!hasAnything) return null;

  return (
    <div className="border-border bg-subtle space-y-3 rounded-lg border p-4">
      <h3 className="text-text-muted text-xs font-semibold tracking-wide uppercase">Planning</h3>

      {yesterdayTomorrow && (
        <div className="space-y-1">
          <p className="text-text-subtle text-xs">Yesterday&apos;s intention for today:</p>
          <p className="text-text-muted text-sm leading-relaxed whitespace-pre-wrap">
            {yesterdayTomorrow}
          </p>
        </div>
      )}

      {futureEntries.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-text-subtle text-xs">Upcoming plans:</p>
          <ul className="space-y-1" role="list">
            {futureEntries.map((entry) => {
              const preview =
                entry.content_md?.slice(0, 120) ||
                Object.values(entry.content ?? {})
                  .filter(Boolean)
                  .join(' ')
                  .slice(0, 120);
              return (
                <li key={entry.id}>
                  <Link
                    href={`/log/${entry.log_date}`}
                    className="group hover:bg-surface block rounded p-2 transition-colors"
                  >
                    <span className="text-accent text-xs font-medium group-hover:underline">
                      {formatLogDate(entry.log_date, 'EEE, MMM d')}
                    </span>
                    {preview && (
                      <p className="text-text-muted mt-0.5 line-clamp-2 text-xs">{preview}…</p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
