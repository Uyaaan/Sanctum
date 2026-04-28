import Link from 'next/link';
import { requireUser } from '@/lib/auth/guards';
import { listAccomplishments } from '@/lib/db/accomplishments';
import { sigilFilterSchema } from '@/lib/validation/accomplishment.schema';
import { Sigil, SIGIL_KEYS, SIGIL_LABELS } from '@/components/Sigil';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { formatLogDate } from '@/lib/format/date';

export default async function WinsPage({ searchParams }) {
  const params = await searchParams;
  const rawSigil = params?.sigil ?? null;
  const sigilFilter = sigilFilterSchema.isValidSync(rawSigil) ? rawSigil : null;

  const user = await requireUser();

  let wins;
  try {
    wins = await listAccomplishments({ userId: user.id, sigilKey: sigilFilter });
  } catch {
    return (
      <ErrorState
        title="Couldn't load wins"
        description="Something went wrong fetching your accomplishments. Try refreshing."
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-amber text-2xl font-semibold">Wins</h2>
        <span className="text-text-subtle text-sm">
          {wins.length} {wins.length === 1 ? 'win' : 'wins'}
        </span>
      </div>

      <SigilFilterChips active={sigilFilter} />

      {wins.length === 0 ? (
        <EmptyState
          title={sigilFilter ? `No ${SIGIL_LABELS[sigilFilter]} wins yet` : 'No wins yet'}
          description="Tap the +Add a win button to inscribe your first."
        />
      ) : (
        <ul className="divide-border border-border divide-y rounded border" role="list">
          {wins.map((win) => (
            <WinRow key={win.id} win={win} />
          ))}
        </ul>
      )}
    </section>
  );
}

function WinRow({ win }) {
  const tags = (win.accomplishment_tags ?? []).map((row) => row.tags).filter(Boolean);

  return (
    <li className="bg-surface/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-text text-sm leading-relaxed whitespace-pre-wrap">{win.text}</p>
        <time className="text-text-subtle shrink-0 text-xs" dateTime={win.occurred_on}>
          {formatLogDate(win.occurred_on, 'MMM d')}
        </time>
      </div>
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="border-rune-gold/30 text-rune-gold bg-surface/60 inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs"
            >
              <Sigil name={tag.sigil_key} size={12} />
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}

function SigilFilterChips({ active }) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="tablist"
      aria-label="Filter wins by sigil"
    >
      <Link
        href="/wins"
        role="tab"
        aria-selected={!active}
        className={`rounded border px-2.5 py-1 text-xs transition-colors ${
          !active
            ? 'border-amber bg-amber/10 text-amber'
            : 'border-border text-text-muted hover:border-amber/50'
        }`}
      >
        All
      </Link>
      {SIGIL_KEYS.map((key) => {
        const isActive = active === key;
        return (
          <Link
            key={key}
            href={`/wins?sigil=${key}`}
            role="tab"
            aria-selected={isActive}
            className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs transition-colors ${
              isActive
                ? 'border-amber bg-amber/10 text-amber'
                : 'border-border text-text-muted hover:border-amber/50'
            }`}
          >
            <Sigil name={key} size={12} />
            {SIGIL_LABELS[key]}
          </Link>
        );
      })}
    </div>
  );
}
