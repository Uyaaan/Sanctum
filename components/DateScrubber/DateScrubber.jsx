'use client';

import { useRouter } from 'next/navigation';
import { addDays, format, parseISO } from 'date-fns';

function pathForDate(date, today) {
  return date === today ? '/dashboard' : `/log/${date}`;
}

export function DateScrubber({ logDate, today }) {
  const router = useRouter();
  const isToday = logDate === today;
  const dateObj = parseISO(logDate);

  function go(target) {
    if (target > today) return;
    router.push(pathForDate(target, today));
  }

  function prev() {
    go(format(addDays(dateObj, -1), 'yyyy-MM-dd'));
  }

  function next() {
    if (isToday) return;
    go(format(addDays(dateObj, 1), 'yyyy-MM-dd'));
  }

  function pickDate(e) {
    const value = e.target.value;
    if (!value) return;
    if (value > today) return;
    go(value);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={prev}
        aria-label="Previous day"
        className="border-border text-text-muted hover:border-amber hover:text-amber rounded border bg-transparent px-2 py-1 text-sm transition-colors"
      >
        ‹
      </button>
      <input
        type="date"
        value={logDate}
        onChange={pickDate}
        max={today}
        aria-label="Pick a day"
        className="border-border bg-surface text-text focus:border-amber focus:ring-amber rounded border px-2 py-1 text-xs transition-colors outline-none focus:ring-1"
      />
      <button
        type="button"
        onClick={next}
        disabled={isToday}
        aria-label="Next day"
        className="border-border text-text-muted hover:border-amber hover:text-amber disabled:hover:border-border disabled:hover:text-text-muted rounded border bg-transparent px-2 py-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30"
      >
        ›
      </button>
      {!isToday && (
        <button
          type="button"
          onClick={() => go(today)}
          className="border-amber/40 text-amber hover:bg-amber/10 rounded border bg-transparent px-2 py-1 text-xs font-medium transition-colors"
        >
          Today
        </button>
      )}
    </div>
  );
}
