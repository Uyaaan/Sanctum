export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 text-center ${className}`}
      role="alert"
    >
      <h3 className="font-display text-crimson text-lg">{title}</h3>
      {description && <p className="text-text-subtle max-w-xs text-sm">{description}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="border-amber/40 text-amber hover:bg-amber/10 mt-2 rounded border bg-transparent px-3 py-1.5 text-sm transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
