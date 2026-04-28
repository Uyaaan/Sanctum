export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`bg-rune-gold/10 animate-pulse rounded ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}
