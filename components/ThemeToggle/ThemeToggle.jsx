'use client';

import { useTheme } from '@/components/ThemeProvider';

const OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="border-border bg-surface inline-flex rounded border"
      role="radiogroup"
      aria-label="Theme"
    >
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          onClick={() => setTheme(value)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors first:rounded-l last:rounded-r ${
            theme === value ? 'bg-accent text-white' : 'text-text-muted hover:text-text'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
