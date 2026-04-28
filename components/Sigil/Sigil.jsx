export const SIGIL_KEYS = ['breakthrough', 'persistence', 'learned', 'helped_someone'];

export const SIGIL_LABELS = {
  breakthrough: 'Breakthrough',
  persistence: 'Persistence',
  learned: 'Learned',
  helped_someone: 'Helped Someone',
};

const SIGIL_COLORS = {
  breakthrough: '#f59e0b',
  persistence: '#6366f1',
  learned: '#10b981',
  helped_someone: '#ec4899',
};

export function Sigil({ name, showLabel = false, className = '' }) {
  const color = SIGIL_COLORS[name] ?? '#71717a';
  const label = SIGIL_LABELS[name] ?? name;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} role="img" aria-label={label}>
      <span
        className="inline-block h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {showLabel && <span className="text-text-muted text-xs">{label}</span>}
    </span>
  );
}
