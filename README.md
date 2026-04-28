# Sanctum

A personal work dashboard. Daily log, accomplishments, monthly journal, command center. Doctor Strange-flavored.

**Status:** v0.1 — feature-complete on localhost. Vercel deployment is on hold; all flows verified at `http://localhost:3002`.

## What's in v0.1

- **Magic-link sign-in** via Supabase (single-user, signups disabled)
- **Daily Log** — date-keyed entries with structured (What I did / Wins / Blockers / Tomorrow) or freeform mode, 800ms-debounced autosave, time-travel via Date Scrubber
- **Accomplishments / Wins** — separate quick-entry FAB with sigil tags (4 starter glyphs: Breakthrough, Persistence, Learned, Helped Someone), filterable list at `/wins`
- **Monthly Journal** at `/journal/[year]/[month]` — templated SQL aggregation (entry count, win count, longest in-month streak, top sigils, weekly echo with previews)
- **Command Center** — Radix Tabs with Quick Links / Scratchpad (autosave) / Todos
- **Search** — full-text websearch over daily logs and wins via Postgres `tsvector` + GIN
- **Streak Badge** in header — counts consecutive non-empty daily-log days, timezone-aware
- **Heatmap Calendar** — 53×7 SVG grid over the last 365 days, intensity bucketed from log size + win count
- **Sanctum Bell** — Web Push pipeline (subscribe + test push working on localhost; Vercel Cron tick configured to fire at user's bell-time post-deploy)
- **Settings** — display name, bell time/timezone, push subscribe/unsubscribe

## Tech stack

- **Frontend & API:** Next.js 16 (App Router), React 19, JavaScript
- **Styling:** Tailwind v4 (CSS-first `@theme` blocks) + Cinzel + Inter
- **Database & Auth:** Supabase (Postgres + magic-link auth + RLS on every table)
- **Web Push:** `web-push` + custom service worker
- **UI primitives:** Radix UI (Dialog, Tabs, AlertDialog, Popover) + Sonner toasts
- **Forms:** react-hook-form + Yup
- **Hosting:** Vercel (deferred — see below)

## Setup

```bash
git clone https://github.com/Uyaaan/Sanctum.git
cd Sanctum
npm install
cp .env.example .env.local
# Fill in .env.local — see below
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) (port 3002 because 3000/3001 are taken by other projects on this machine).

## Available scripts

| Script                 | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Local dev server (Turbopack) on port 3002 |
| `npm run build`        | Production build                          |
| `npm run start`        | Serve the production build                |
| `npm run lint`         | ESLint check                              |
| `npm run format`       | Prettier write                            |
| `npm run format:check` | Prettier check                            |

Pre-commit hooks (Husky) run lint-staged: Prettier on changed files, ESLint --fix on `.js/.jsx/.mjs`, Secretlint on everything.

## Environment variables

See [`.env.example`](.env.example). Required:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, admin (used by `/api/push/tick` to bypass RLS)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` + `VAPID_SUBJECT` — Web Push
- `CRON_SECRET` — gates `/api/push/tick` (Vercel Cron sends this as `Authorization: Bearer …`)

Generate VAPID keys: `node -e "console.log(require('web-push').generateVAPIDKeys())"` (web-push is already in deps).

## Folder structure

See [CLAUDE.md](CLAUDE.md) for the annotated map.

## Verifying the Sanctum Bell pipeline on localhost

Vercel Cron only fires post-deploy, so the time-window dispatch in `/api/push/tick` won't auto-trigger. To verify the pipeline locally:

1. Open `/settings`, click **Subscribe to Sanctum Bell**, allow notifications.
2. Click **Send test push** — should fire a desktop notification immediately.
3. To exercise the cron route end-to-end, set your bell time in settings to the current minute, then:
   ```bash
   curl -X POST http://localhost:3002/api/push/tick \
     -H "Authorization: Bearer $CRON_SECRET"
   ```
   Should return `{ok: true, matched: 1, dispatched: 1}` and fire the notification.

## Deployment (deferred until greenlight)

v0.1 ships only on localhost. When deploy is approved:

1. **Vercel:** import `Uyaaan/Sanctum` as a project. Set Framework: Next.js, Build: `npm run build`.
2. **Env vars:** copy all values from `.env.local` to Vercel project settings (mark `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET` as sensitive).
3. **Site URL:** in Vercel, set `NEXT_PUBLIC_SITE_URL` to the production URL (e.g. `https://sanctum.vercel.app`).
4. **Supabase Auth:** in Supabase Dashboard → Auth → URL Configuration, change Site URL to the production URL and add it to Redirect URLs.
5. **Tag:** `git push origin v0.1.0`.
6. **Cron:** confirm `vercel.json` Cron Job appears in Vercel project Settings → Cron Jobs (`/api/push/tick` every 5 min).
7. **Sentry (recommended):** install `@sentry/nextjs` per their wizard, configure source maps upload.
8. **PWA icons:** add 192×192 and 512×512 PNGs at `public/icons/` and a `public/manifest.webmanifest` to make the app installable to home screen.
9. **Smoke test:** install on phone, sign in via magic link, set bell time → wait for cron-driven notification.

## License

[MIT](LICENSE)
