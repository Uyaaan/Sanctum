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
      <h3 className="text-danger text-lg font-medium">{title}</h3>
      {description && <p className="text-text-subtle max-w-xs text-sm">{description}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="border-accent/40 text-accent hover:bg-accent/10 mt-2 rounded border bg-transparent px-3 py-1.5 text-sm transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
