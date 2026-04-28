import Link from 'next/link';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function decompose(year, month) {
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  return { prevYear, prevMonth, nextYear, nextMonth };
}

export function MonthBrowser({ year, month, today }) {
  const { prevYear, prevMonth, nextYear, nextMonth } = decompose(year, month);

  const todayYear = parseInt(today.slice(0, 4), 10);
  const todayMonth = parseInt(today.slice(5, 7), 10);
  const isFutureNext = nextYear > todayYear || (nextYear === todayYear && nextMonth > todayMonth);

  return (
    <nav aria-label="Month browser" className="flex items-center justify-between gap-3">
      <Link
        href={`/journal/${prevYear}/${String(prevMonth).padStart(2, '0')}`}
        className="text-text-muted hover:text-accent border-border hover:border-accent/50 rounded border px-2.5 py-1 text-xs transition-colors"
      >
        ← {MONTH_NAMES[prevMonth - 1]}
      </Link>

      <h2 className="text-text text-xl font-semibold">
        {MONTH_NAMES[month - 1]} {year}
      </h2>

      {isFutureNext ? (
        <span
          aria-disabled="true"
          className="border-border text-text-subtle/50 cursor-not-allowed rounded border px-2.5 py-1 text-xs"
        >
          {MONTH_NAMES[nextMonth - 1]} →
        </span>
      ) : (
        <Link
          href={`/journal/${nextYear}/${String(nextMonth).padStart(2, '0')}`}
          className="text-text-muted hover:text-accent border-border hover:border-accent/50 rounded border px-2.5 py-1 text-xs transition-colors"
        >
          {MONTH_NAMES[nextMonth - 1]} →
        </Link>
      )}
    </nav>
  );
}
