'use client';

import { useState } from 'react';
import { NavLink } from '@/components/NavLink';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/wins', label: 'Wins', icon: TrophyIcon },
  { href: '/search', label: 'Search', icon: SearchIcon },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function AppShell({ children, streakBadge, journalHref }) {
  const [pinned, setPinned] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sanctum-sidebar-pinned') === 'true';
  });
  const [hovering, setHovering] = useState(false);

  function togglePin() {
    const next = !pinned;
    setPinned(next);
    localStorage.setItem('sanctum-sidebar-pinned', String(next));
  }

  const isOpen = pinned || hovering;

  const allNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { href: journalHref, label: 'Journal', icon: BookIcon },
    { href: '/wins', label: 'Wins', icon: TrophyIcon },
    { href: '/search', label: 'Search', icon: SearchIcon },
    { href: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="bg-bg flex min-h-screen">
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside
        className="border-border bg-surface relative hidden flex-col border-r md:flex"
        style={{ width: isOpen ? '240px' : '56px', transition: 'width 200ms ease' }}
        onMouseEnter={() => !pinned && setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        aria-label="Primary navigation"
      >
        {/* Brand */}
        <div className="border-border flex h-14 items-center overflow-hidden border-b px-3">
          <span className="text-accent shrink-0 text-xl font-bold">S</span>
          {isOpen && (
            <span className="text-text ml-2 overflow-hidden font-semibold whitespace-nowrap">
              Sanctum
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-hidden p-2">
          {allNavItems.map(({ href, label, icon: Icon }) => (
            <NavLink
              key={href}
              href={href}
              className="text-text-muted hover:bg-subtle hover:text-text flex h-9 items-center gap-3 overflow-hidden rounded-md px-2.5 text-sm transition-colors"
              activeClassName="bg-accent/10 text-accent hover:bg-accent/10 hover:text-accent"
            >
              <Icon size={16} className="shrink-0" aria-hidden="true" />
              {isOpen && <span className="whitespace-nowrap">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer: streak badge + pin toggle */}
        <div className="border-border flex items-center overflow-hidden border-t p-2">
          {isOpen ? (
            <>
              <div className="min-w-0 flex-1 truncate">{streakBadge}</div>
              <button
                onClick={togglePin}
                className="text-text-subtle hover:text-text ml-2 shrink-0 rounded p-1 transition-colors"
                aria-label={pinned ? 'Unpin sidebar' : 'Pin sidebar open'}
                title={pinned ? 'Unpin sidebar' : 'Pin sidebar open'}
              >
                <PinIcon size={14} pinned={pinned} />
              </button>
            </>
          ) : (
            <div className="flex w-full justify-center">{streakBadge}</div>
          )}
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="min-w-0 flex-1 overflow-auto pb-16 md:pb-0">
        <div className="mx-auto max-w-4xl px-6 py-8">{children}</div>
      </main>

      {/* ── Mobile bottom tab bar ────────────────────────────── */}
      <nav
        className="border-border bg-surface fixed inset-x-0 bottom-0 flex items-stretch border-t md:hidden"
        aria-label="Primary navigation"
      >
        {[
          ...NAV_ITEMS.slice(0, 1),
          { href: journalHref, label: 'Journal', icon: BookIcon },
          ...NAV_ITEMS.slice(1),
        ].map(({ href, label, icon: Icon }) => (
          <NavLink
            key={href}
            href={href}
            className="text-text-subtle flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition-colors"
            activeClassName="text-accent"
          >
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

/* ── Inline SVG icons ──────────────────────────────────────── */

function HomeIcon({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function BookIcon({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function TrophyIcon({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 9H4a2 2 0 0 1-2-2V5h4" />
      <path d="M18 9h2a2 2 0 0 0 2-2V5h-4" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
      <path d="M6 5h12v6a6 6 0 0 1-12 0V5z" />
    </svg>
  );
}

function SearchIcon({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function SettingsIcon({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function PinIcon({ size = 14, pinned = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={pinned ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2l3 7h4l-3.5 5 1.5 7L12 18l-5 3 1.5-7L5 9h4l3-7z" />
    </svg>
  );
}
