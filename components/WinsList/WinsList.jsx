'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sigil, SIGIL_KEYS, SIGIL_LABELS } from '@/components/Sigil';
import { EmptyState } from '@/components/EmptyState';
import { AccomplishmentEditDialog } from '@/components/AccomplishmentEditDialog';
import { formatLogDate } from '@/lib/format/date';

export function WinsList({ initialWins, sigilFilter, today }) {
  const [wins, setWins] = useState(initialWins);

  function handleUpdated(updated) {
    setWins((prev) => prev.map((w) => (w.id === updated.id ? { ...w, ...updated } : w)));
  }

  function handleDeleted(id) {
    setWins((prev) => prev.filter((w) => w.id !== id));
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-text text-2xl font-semibold">Wins</h2>
        <span className="text-text-subtle text-sm">
          {wins.length} {wins.length === 1 ? 'win' : 'wins'}
        </span>
      </div>

      <SigilFilterChips active={sigilFilter} />

      {wins.length === 0 ? (
        <EmptyState
          title={sigilFilter ? `No ${SIGIL_LABELS[sigilFilter]} wins yet` : 'No wins yet'}
          description="Tap the +Add a win button to record your first."
        />
      ) : (
        <ul className="divide-border border-border divide-y rounded border" role="list">
          {wins.map((win) => (
            <WinRow
              key={win.id}
              win={win}
              today={today}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function WinRow({ win, today, onUpdated, onDeleted }) {
  const tags = (win.accomplishment_tags ?? []).map((row) => row.tags).filter(Boolean);

  return (
    <li className="group p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-text flex-1 text-sm leading-relaxed whitespace-pre-wrap">{win.text}</p>
        <div className="flex shrink-0 items-center gap-2">
          <time className="text-text-subtle text-xs" dateTime={win.occurred_on}>
            {formatLogDate(win.occurred_on, 'MMM d')}
          </time>
          <AccomplishmentEditDialog
            win={win}
            today={today}
            onUpdated={onUpdated}
            onDeleted={onDeleted}
          >
            <button
              type="button"
              className="text-text-subtle hover:text-text rounded p-0.5 opacity-0 transition-all group-hover:opacity-100"
              aria-label="Edit win"
            >
              <PencilIcon size={13} />
            </button>
          </AccomplishmentEditDialog>
        </div>
      </div>
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="border-border text-text-muted bg-subtle inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs"
            >
              <Sigil name={tag.sigil_key} />
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
      aria-label="Filter wins by tag"
    >
      <Link
        href="/wins"
        role="tab"
        aria-selected={!active}
        className={`rounded border px-2.5 py-1 text-xs transition-colors ${
          !active
            ? 'border-accent bg-accent/10 text-accent'
            : 'border-border text-text-muted hover:border-accent/50'
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
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border text-text-muted hover:border-accent/50'
            }`}
          >
            <Sigil name={key} />
            {SIGIL_LABELS[key]}
          </Link>
        );
      })}
    </div>
  );
}

function PencilIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
