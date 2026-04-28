import { addDays, format, getDay, parseISO, subDays } from 'date-fns';
import { createClient } from '@/lib/supabase/server';

const COLS = 53;
const ROWS = 7;
const CELL = 11;
const GAP = 2;
const SVG_WIDTH = COLS * (CELL + GAP);
const SVG_HEIGHT = ROWS * (CELL + GAP);

function intensityBucket({ chars, wins }) {
  const score = chars + wins * 200;
  if (score === 0) return 0;
  if (score >= 2000) return 4;
  if (score >= 800) return 3;
  if (score >= 200) return 2;
  return 1;
}

const OPACITY_BY_BUCKET = [0.06, 0.22, 0.38, 0.6, 0.85];

export async function HeatmapCalendar({ userId, today }) {
  const supabase = await createClient();

  const todayDate = parseISO(today);
  const startBack = subDays(todayDate, 365);
  const startDayOfWeek = getDay(startBack);
  const gridStart = subDays(startBack, startDayOfWeek);
  const startStr = format(gridStart, 'yyyy-MM-dd');

  const [logsResult, winsResult] = await Promise.all([
    supabase
      .from('daily_logs')
      .select('log_date, content_md, content')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .gte('log_date', startStr)
      .lte('log_date', today),
    supabase
      .from('accomplishments')
      .select('occurred_on')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .gte('occurred_on', startStr)
      .lte('occurred_on', today),
  ]);

  const dataByDate = new Map();

  for (const log of logsResult.data ?? []) {
    const chars = log.content_md?.length ?? 0;
    const hasContent = chars > 0 || (log.content && Object.keys(log.content).length > 0);
    if (!hasContent) continue;
    dataByDate.set(log.log_date, { chars, wins: 0 });
  }

  for (const win of winsResult.data ?? []) {
    const date = win.occurred_on;
    const existing = dataByDate.get(date) ?? { chars: 0, wins: 0 };
    existing.wins += 1;
    dataByDate.set(date, existing);
  }

  const cells = [];
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const cellDate = addDays(gridStart, col * 7 + row);
      const dateStr = format(cellDate, 'yyyy-MM-dd');
      if (dateStr > today) continue;

      const data = dataByDate.get(dateStr) ?? { chars: 0, wins: 0 };
      const bucket = intensityBucket(data);
      const opacity = OPACITY_BY_BUCKET[bucket];
      const isToday = dateStr === today;

      cells.push({
        key: `${col}-${row}`,
        x: col * (CELL + GAP),
        y: row * (CELL + GAP),
        opacity,
        isToday,
        title:
          data.chars + data.wins > 0
            ? `${format(cellDate, 'MMM d, yyyy')} — ${data.chars.toLocaleString()} chars, ${data.wins} win${data.wins === 1 ? '' : 's'}`
            : `${format(cellDate, 'MMM d, yyyy')} — no entry`,
      });
    }
  }

  return (
    <figure className="border-border bg-surface/30 overflow-x-auto rounded border p-3">
      <figcaption className="text-rune-gold font-display mb-2 text-[0.65rem] tracking-[0.2em] uppercase">
        Last 365 days
      </figcaption>
      <svg
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="text-amber"
        role="img"
        aria-label="Activity heatmap of daily logs and wins over the last 365 days"
      >
        {cells.map((cell) => (
          <rect
            key={cell.key}
            x={cell.x}
            y={cell.y}
            width={CELL}
            height={CELL}
            rx={2}
            fill="currentColor"
            fillOpacity={cell.opacity}
            stroke={cell.isToday ? 'currentColor' : 'none'}
            strokeWidth={cell.isToday ? 1 : 0}
            strokeOpacity={cell.isToday ? 0.7 : 0}
          >
            <title>{cell.title}</title>
          </rect>
        ))}
      </svg>
    </figure>
  );
}
