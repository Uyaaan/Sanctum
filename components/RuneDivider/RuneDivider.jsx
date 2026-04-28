export function RuneDivider({ className = '' }) {
  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      role="separator"
      aria-orientation="horizontal"
    >
      <div className="from-rune-gold/0 via-rune-gold/30 to-rune-gold/0 h-px flex-1 bg-gradient-to-r" />
      <svg
        viewBox="0 0 16 16"
        width="14"
        height="14"
        className="text-rune-gold/60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="2.2" />
        <path d="M8 1.5v3 M8 11.5v3 M1.5 8h3 M11.5 8h3" />
      </svg>
      <div className="from-rune-gold/0 via-rune-gold/30 to-rune-gold/0 h-px flex-1 bg-gradient-to-l" />
    </div>
  );
}
