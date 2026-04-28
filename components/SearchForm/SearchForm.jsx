'use client';

import { useState } from 'react';

export function SearchForm({ initialQuery = '' }) {
  const [value, setValue] = useState(initialQuery);

  return (
    <form action="/search" method="get" className="flex gap-2" role="search">
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search entries and wins…"
        autoComplete="off"
        autoFocus
        className="border-border bg-subtle text-text placeholder-text-subtle focus:border-accent focus:ring-accent w-full rounded border px-3 py-2 text-sm transition-colors outline-none focus:ring-1"
      />
      <button
        type="submit"
        className="bg-accent hover:bg-accent/90 rounded px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50"
        disabled={!value.trim()}
      >
        Search
      </button>
    </form>
  );
}
