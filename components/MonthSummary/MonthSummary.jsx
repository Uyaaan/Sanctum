import Link from 'next/link';
import { formatLogDate } from '@/lib/format/date';
import { Sigil } from '@/components/Sigil';
import { EmptyState } from '@/components/EmptyState';

export function MonthSummary({ summary }) {
  if (!summary) {
    return (
      <EmptyState
        title="Couldn't load this month"
        description="The month_summary RPC returned nothing. Try refreshing."
      />
    );
  }

  const { entry_count, win_count, longest_streak_in_month, top_tags, weeks, wins } = summary;

  if (entry_count === 0 && win_count === 0) {
    return (
      <EmptyState
        title="Nothing this month"
        description="No daily logs or wins yet. Start writing today and this page will fill in."
      />
    );
  }

  return (
    <div className="space-y-8">
      <Stats
        entryCount={entry_count}
        winCount={win_count}
        longestStreak={longest_streak_in_month}
      />

      {top_tags && top_tags.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-text-muted text-xs font-semibold tracking-wide uppercase">
            Top Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {top_tags.map((t) => (
              <span
                key={t.slug}
                className="border-border text-text-muted bg-subtle inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs"
              >
                {t.sigil_key && <Sigil name={t.sigil_key} />}
                <span>
                  {t.name} <span className="text-text-subtle">· {t.cnt}</span>
                </span>
              </span>
            ))}
          </div>
        </section>
      )}

      {wins && wins.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-text-muted text-xs font-semibold tracking-wide uppercase">
            Wins ({wins.length})
          </h3>
          <ul className="divide-border border-border divide-y rounded border" role="list">
            {wins.map((w) => (
              <li key={w.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-text text-sm leading-relaxed whitespace-pre-wrap">{w.text}</p>
                  <Link
                    href={`/log/${w.occurred_on}`}
                    className="text-text-subtle hover:text-accent shrink-0 text-xs transition-colors"
                  >
                    {formatLogDate(w.occurred_on, 'MMM d')} ↗
                  </Link>
                </div>
                {Array.isArray(w.sigil_keys) && w.sigil_keys.length > 0 && (
                  <div className="mt-2 flex gap-1.5">
                    {w.sigil_keys.map((key, i) => (
                      <Sigil key={`${key}-${i}`} name={key} showLabel />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {weeks && weeks.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-text-muted text-xs font-semibold tracking-wide uppercase">
            Weekly Echo
          </h3>
          {weeks.map((w) => (
            <div key={w.week_start} className="space-y-2">
              <div className="flex items-center gap-3">
                <h4 className="text-text-muted text-sm font-medium">
                  Week of {formatLogDate(w.week_start, 'MMM d')}
                </h4>
                <span className="text-text-subtle text-xs">
                  {w.entries.length} {w.entries.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>
              <ul className="space-y-2 pl-4" role="list">
                {w.entries.map((entry) => (
                  <li key={entry.date} className="border-border/50 border-l-2 pl-3">
                    <Link href={`/log/${entry.date}`} className="group block">
                      <div className="flex items-baseline gap-2">
                        <span className="text-accent text-xs font-medium group-hover:underline">
                          {formatLogDate(entry.date, 'EEE, MMM d')}
                        </span>
                        <span className="text-text-subtle text-[0.65rem] tracking-wider uppercase">
                          {entry.mode}
                        </span>
                      </div>
                      {entry.preview && (
                        <p className="text-text-muted mt-0.5 line-clamp-2 text-xs">
                          {entry.preview}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <hr className="border-border mt-4" />
        </section>
      )}
    </div>
  );
}

function Stats({ entryCount, winCount, longestStreak }) {
  return (
    <dl className="grid grid-cols-3 gap-4 sm:gap-6">
      <Stat label="Entries" value={entryCount} />
      <Stat label="Wins" value={winCount} />
      <Stat label="Longest streak" value={`${longestStreak} d`} />
    </dl>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border-border bg-subtle rounded border p-3">
      <dt className="text-text-subtle text-[0.65rem] tracking-[0.2em] uppercase">{label}</dt>
      <dd className="text-accent mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
