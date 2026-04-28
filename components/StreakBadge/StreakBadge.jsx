import { createClient } from '@/lib/supabase/server';

export async function StreakBadge({ userId, today }) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('current_streak', {
    p_user_id: userId,
    p_today: today,
  });

  if (error) return null;
  const count = typeof data === 'number' ? data : 0;
  if (count === 0) return null;

  return (
    <div
      className="text-accent border-accent/20 bg-subtle inline-flex items-center gap-1.5 rounded border px-2 py-0.5"
      role="status"
      aria-label={`Current streak: ${count} day${count === 1 ? '' : 's'}`}
    >
      <FlameGlyph size={12} />
      <span className="text-xs font-medium tabular-nums">
        {count} day{count === 1 ? '' : 's'}
      </span>
    </div>
  );
}

function FlameGlyph({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2c-2 4-5 6-5 11a5 5 0 0 0 10 0c0-3-2-5-3-8-1 2-2 3-2 5-1-1-1-3 0-8z" />
    </svg>
  );
}
