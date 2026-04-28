'use client';

export function SlashCommandMenu({ items, onSelect, textareaRef }) {
  if (!items.length) return null;

  return (
    <ul
      role="listbox"
      aria-label="Slash commands"
      className="border-border bg-surface absolute z-50 w-48 overflow-hidden rounded-lg border shadow-xl"
    >
      {items.map((cmd) => (
        <li key={cmd.id}>
          <button
            type="button"
            role="option"
            aria-selected="false"
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(cmd);
            }}
            className="text-text-muted hover:bg-subtle hover:text-text flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors"
          >
            <span className="text-accent font-mono">/{cmd.id}</span>
            <span>{cmd.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
