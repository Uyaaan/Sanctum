export function EmptyState({ title, description, action, icon: Icon, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 text-center ${className}`}
      role="status"
    >
      {Icon && <Icon size={28} className="text-text-subtle" aria-hidden="true" />}
      <h3 className="text-text-muted text-lg font-medium">{title}</h3>
      {description && <p className="text-text-subtle max-w-xs text-sm">{description}</p>}
      {action}
    </div>
  );
}
