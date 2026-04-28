import Link from 'next/link';
import { formatLogDate } from '@/lib/format/date';
import { Sigil } from '@/components/Sigil';
import { EmptyState } from '@/components/EmptyState';

const PREVIEW_CHARS = 200;

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightTerms(text, query) {
  const terms = query
    .split(/\s+/)
    .map((t) => t.replace(/^["']|["']$/g, ''))
    .filter((t) => t.length > 1);
  if (terms.length === 0) return text;

  const pattern = new RegExp(`(${terms.map(escapeRegex).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return parts.map((part, i) =>
    pattern.test(part) ? (
      <mark key={i} className="bg-amber/20 text-amber rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function previewWindow(text, query) {
  if (!text) return '';
  const lowerText = text.toLowerCase();
  const firstTerm = query
    .split(/\s+/)
    .map((t) => t.replace(/^["']|["']$/g, '').toLowerCase())
    .find((t) => t.length > 1 && lowerText.includes(t));

  if (!firstTerm) {
    return text.slice(0, PREVIEW_CHARS) + (text.length > PREVIEW_CHARS ? '…' : '');
  }

  const matchIdx = lowerText.indexOf(firstTerm);
  const start = Math.max(0, matchIdx - Math.floor(PREVIEW_CHARS / 3));
  const end = Math.min(text.length, start + PREVIEW_CHARS);
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
}

export function SearchResults({ results, query }) {
  const totalCount = results.logs.length + results.wins.length;

  if (totalCount === 0) {
    return (
      <EmptyState
        title="No matches"
        description={`Nothing in your daily logs or wins matches "${query}".`}
      />
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-text-subtle text-xs">
        {totalCount} match{totalCount === 1 ? '' : 'es'} for{' '}
        <span className="text-text">&ldquo;{query}&rdquo;</span>
      </p>

      {results.logs.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-display text-rune-gold text-xs tracking-[0.15em] uppercase">
            Daily Log ({results.logs.length})
          </h3>
          <ul className="divide-border border-border divide-y rounded border" role="list">
            {results.logs.map((log) => (
              <li key={log.id} className="bg-surface/40 p-4">
                <Link href={`/log/${log.log_date}`} className="group block">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-amber text-sm group-hover:underline">
                      {formatLogDate(log.log_date)}
                    </span>
                    <span className="text-text-subtle text-xs tracking-wider uppercase">
                      {log.mode}
                    </span>
                  </div>
                  <p className="text-text-muted mt-1 text-sm whitespace-pre-wrap">
                    {highlightTerms(previewWindow(log.content_md, query), query)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {results.wins.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-display text-rune-gold text-xs tracking-[0.15em] uppercase">
            Wins ({results.wins.length})
          </h3>
          <ul className="divide-border border-border divide-y rounded border" role="list">
            {results.wins.map((win) => {
              const tags = (win.accomplishment_tags ?? []).map((row) => row.tags).filter(Boolean);
              return (
                <li key={win.id} className="bg-surface/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-text text-sm leading-relaxed whitespace-pre-wrap">
                      {highlightTerms(win.text, query)}
                    </p>
                    <Link
                      href={win.daily_log_id ? `/log/${win.occurred_on}` : '/wins'}
                      className="text-text-subtle hover:text-amber shrink-0 text-xs transition-colors"
                    >
                      {formatLogDate(win.occurred_on, 'MMM d')} ↗
                    </Link>
                  </div>
                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="border-rune-gold/30 text-rune-gold inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs"
                        >
                          <Sigil name={tag.sigil_key} size={12} />
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
