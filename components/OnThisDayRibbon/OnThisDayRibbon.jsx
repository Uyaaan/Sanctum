import Link from 'next/link';

export function OnThisDayRibbon({ entries }) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="border-accent/20 bg-accent/5 space-y-2 rounded-lg border p-3">
      <p className="text-accent text-xs font-semibold tracking-wide uppercase">On this day</p>
      <ul className="space-y-2" role="list">
        {entries.map((entry) => (
          <li key={entry.id}>
            <Link
              href={`/log/${entry.log_date}`}
              className="group hover:bg-accent/5 flex items-start gap-3 rounded transition-colors"
            >
              <span className="text-accent/70 shrink-0 text-xs font-medium tabular-nums">
                {entry.yearsAgo}y ago
              </span>
              <p className="text-text-muted group-hover:text-text line-clamp-2 text-xs">
                {entry.preview}
                {entry.preview.length === 140 ? '…' : ''}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
