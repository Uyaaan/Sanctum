<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version (16.2.4) has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

---

# Sanctum — Cross-Tool Agent Rules

[CLAUDE.md](CLAUDE.md) is authoritative. This file mirrors it for tools that do not read CLAUDE.md.

## Stack

- Next.js 16 App Router + React 19 + JavaScript (NOT TypeScript)
- Tailwind v4 (CSS-first config in `app/globals.css`, no `tailwind.config.js`)
- Supabase (Postgres + Auth) — magic link, single user invited, RLS on every table
- Phosphor icons (`@phosphor-icons/react`)
- Doctor Strange "Obsidian & Amber" palette; Cinzel + Inter fonts
- PWA via `@serwist/next`; Sanctum Bell via Vercel Cron + Web Push
- **Vercel deploy is on hold for v0.1.** Verify everything on `http://localhost:3000`.

## Conventions

- Component folders are PascalCase, each with `index.js` re-export
- Forms: `react-hook-form` + `yup`
- Soft-delete via `deleted_at` on user-data tables
- All tables get RLS policies BEFORE any insert
- `auth.uid() = user_id` is the standard policy predicate

## Aesthetic

- 4 starter sigils for tags: `breakthrough`, `persistence`, `learned`, `helped_someone`. SVG line art.
- Custom user-defined tags ship in v0.2 — do not add UI for them in v0.1.
- Push payloads carry static `"Sanctum Bell"` only; never log content (lock-screen safe).

## Git

- Author email for this repo: `uyanqwerty@gmail.com` (local config)
- No `Co-Authored-By` trailers
- Always ask the human for the commit message
