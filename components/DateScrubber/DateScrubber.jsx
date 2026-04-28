'use client';

import { useRouter } from 'next/navigation';
import { addDays, format, parseISO } from 'date-fns';
import { DatePicker } from '@/components/DatePicker';

function pathForDate(date, today) {
  return date === today ? '/dashboard' : `/log/${date}`;
}

export function DateScrubber({ logDate, today }) {
  const router = useRouter();
  const isToday = logDate === today;
  const dateObj = parseISO(logDate);

  function go(target) {
    router.push(pathForDate(target, today));
  }

  function prev() {
    go(format(addDays(dateObj, -1), 'yyyy-MM-dd'));
  }

  function next() {
    if (isToday) return;
    go(format(addDays(dateObj, 1), 'yyyy-MM-dd'));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={prev}
        aria-label="Previous day"
        className="border-border text-text-muted hover:border-accent hover:text-accent rounded border bg-transparent px-2 py-1 text-sm transition-colors"
      >
        ‹
      </button>

      <DatePicker
        value={logDate}
        onChange={(date) => go(date)}
        disableFuture={false}
        placeholder="Pick a day"
        className="text-xs"
      />

      <button
        type="button"
        onClick={next}
        disabled={isToday}
        aria-label="Next day"
        className="border-border text-text-muted hover:border-accent hover:text-accent disabled:hover:border-border disabled:hover:text-text-muted rounded border bg-transparent px-2 py-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30"
      >
        ›
      </button>
      {!isToday && (
        <button
          type="button"
          onClick={() => go(today)}
          className="border-accent/40 text-accent hover:bg-accent/10 rounded border bg-transparent px-2 py-1 text-xs font-medium transition-colors"
        >
          Today
        </button>
      )}
    </div>
  );
}
