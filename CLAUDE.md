# Sanctum — Project-Specific Claude Rules

These rules layer on top of the user's global `~/.claude/CLAUDE.md`. When a rule here conflicts with the global file, this file wins for the Sanctum project.

`AGENTS.md` carries the same content as a cross-tool agent rules file.

---

## Stack lock

- **Next.js 16** (App Router) — `create-next-app@latest` pulled 16.2.4. **APIs and conventions differ from Next.js 15.** Read `node_modules/next/dist/docs/` before writing route handlers, server actions, middleware, or unfamiliar APIs.
- **React 19**.
- **Tailwind v4** — CSS-first config via `@theme` blocks in `app/globals.css`. **No `tailwind.config.js`.** PostCSS plugin via `postcss.config.mjs` already wired.
- **JavaScript only**, never TypeScript. `jsconfig.json` aliases `@/* → ./*`.
- **Supabase** for Postgres + Auth + RLS.
- **Vercel deploy is on hold** until Andrei greenlights. Do NOT deploy without explicit go-ahead. v0.2 verified on `http://localhost:3002`.

## Aesthetic — Clean Modern (v0.2)

Design system tokens in `app/globals.css` via `@theme`. Light theme is the default; dark theme applied via `[data-theme="dark"]`; system preference fallback via `@media (prefers-color-scheme: dark)`.

| Token                 | Light     | Dark      | Use                          |
| --------------------- | --------- | --------- | ---------------------------- |
| `--color-bg`          | `#FAFAFA` | `#09090B` | Page background              |
| `--color-surface`     | `#FFFFFF` | `#18181B` | Cards, panels, sidebar       |
| `--color-subtle`      | `#F3F4F6` | `#27272A` | Hover states, input bg       |
| `--color-text`        | `#18181B` | `#FAFAFA` | Primary text                 |
| `--color-text-muted`  | `#52525B` | `#A1A1AA` | Secondary text               |
| `--color-text-subtle` | `#71717A` | `#71717A` | Placeholder, tertiary        |
| `--color-border`      | `#E4E4E7` | `#27272A` | Borders                      |
| `--color-accent`      | `#6366F1` | `#818CF8` | Buttons, links, active state |
| `--color-danger`      | `#DC2626` | `#EF4444` | Destructive actions          |

- **Font:** Inter only (via `next/font`). Cinzel dropped.
- **Sigils:** render as small colored inline dots + text label. Data model unchanged.
- **Theme toggle:** light / dark / system — persisted in `localStorage('sanctum-theme')`, toggled in Settings via `<ThemeToggle>`.

## Sigils (v0.2)

4 starter sigils seeded by `handle_new_user` trigger: `breakthrough`, `persistence`, `learned`, `helped_someone`. Rendered as colored dots (`SIGIL_COLORS` map in `Sigil.jsx`). SVG glyphs in `components/Sigil/glyphs/` are unused but retained.

**Custom user-defined tag UI ships in v0.3.** Do NOT add tag management UI in v0.2.

## Architecture conventions

- **Route groups:**
  - `app/(auth)/` for public auth surfaces (sign-in, callback)
  - `app/(app)/` for the auth-walled surface; `(app)/layout.js` runs `requireUser()` server-side
- **Supabase clients:** `@supabase/ssr` — `createServerClient` for server components / route handlers / server actions; `createBrowserClient` for client components; middleware client in root `middleware.js` for session refresh.
- **Forms:** `react-hook-form` + `yup` (per global JS rule — Yup not Zod here).
- **Validation schemas** live in `lib/validation/`, one file per resource.
- **Soft delete on user-data tables** via `deleted_at timestamptz`. Hard delete only for `audit_logs` and `push_subscriptions`.
- **Audit logs** capture deletes + auth events only. Skip per-mutation logging — too noisy.
- **DB conventions:** snake_case plural tables, UUID v4 PKs, FKs as `<singular>_id`, every table has `created_at` + `updated_at`. UTC in DB, local TZ on display via `date-fns-tz`.

## Security (non-negotiable)

- RLS enabled on every table BEFORE any insert.
- Standard RLS policy block (4 policies: select / insert / update / delete with `auth.uid() = user_id`) applied to every owned-resource table.
- Push notification payloads carry static `"Sanctum Bell"` text only — **never log content** (visible on lock screen).
- `CRON_SECRET` env var gates the `/api/push/tick` route via `Authorization: Bearer` header.
- Supabase Auth: `Allow new sign-ups` is OFF; only `sirpressed22@gmail.com` is invited.
- All form inputs validated via Yup at the boundary. No raw query string concat.
- User-facing errors are generic ("Something went wrong"); structured server-side log includes a correlation ID the user can quote.

## Localhost-first verification (v0.1)

- All testing happens on `http://localhost:3000`. **Vercel deploy is deferred.**
- Magic-link `emailRedirectTo` points to `http://localhost:3000/auth/callback` — once we're ready to deploy, replace hardcode with `process.env.NEXT_PUBLIC_SITE_URL`.
- Add `http://localhost:3000` to Supabase Auth allowed redirect URLs.
- Web Push subscriptions work fine on `http://localhost` in Chrome / Edge / Firefox.
- The Sanctum Bell `/api/push/tick` route is exercised manually via curl during dev (Vercel Cron only fires post-deploy).

## Per-Andrei rules (global recap, important enough to repeat)

- Git author for all Sanctum commits: `uyanqwerty@gmail.com` / `Uyaaan` (set as **local** config in this repo; global config remains untouched).
- **No `Co-Authored-By` trailers in commits.**
- **Always ask Andrei for the commit message** before committing — never auto-generate.
- **After commit, push immediately** unless told otherwise; drop the GitHub commit URL into chat.
- **Plan-mode questions:** 5–10 via AskUserQuestion (UI multichoice).

## Folder / file map

> Auto-regenerate this section after every commit that adds/removes top-level files. Touch only the lines that changed (token-efficient).

- `app/` — Next.js App Router: routes, layouts, route handlers
- `app/(auth)/sign-in/` and `app/(auth)/auth/callback/` — public auth surface
- `app/(app)/` — auth-walled routes (`dashboard`, `log/[date]`, `wins`, `journal/[year]/[month]`, `search`, `settings`); layout enforces `requireUser()` and renders shared header + nav + `<QuickWin>` FAB
- `app/api/push/{subscribe,unsubscribe,tick}/` — Web Push endpoints; `tick` is `CRON_SECRET`-gated for Vercel Cron
- `app/actions/` — server actions: `accomplishments.js`, `quick-links.js`, `scratchpad.js`, `todos.js`, `profile.js`, `push.js`
- `components/` — PascalCase folders, each with `index.js` re-export. Includes `AppShell` (sidebar + bottom tab bar), `NavLink`, `ThemeProvider`, `ThemeToggle`, `DailyLog`, `DailyLogEditor`, `DateScrubber`, `DatePicker` (Radix Popover calendar), `QuickWin`, `Sigil` (colored dot + label; glyphs folder unused), `StreakBadge`, `HeatmapCalendar`, `SearchForm`, `SearchResults`, `MonthBrowser`, `MonthSummary`, `CommandCenter` (Tabs + 3 panels), `SettingsForm`, `PushSubscribeButton`, `TemplatesForm`, `AccomplishmentEditDialog`, `QuickLinkEditDialog`, `WinsList`, `PlanningPanel`, `OnThisDayRibbon`, `MarkdownView`, `SlashCommandMenu`, primitives (`EmptyState`, `ErrorState`, `Skeleton`)
- `lib/supabase/` — `client.js` (browser), `server.js` (server-component cookie-aware), `admin.js` (service-role for cron tick, server-only)
- `lib/auth/guards.js` — `requireUser()` server helper
- `lib/db/` — typed-ish access helpers per resource: `daily-logs`, `accomplishments`, `quick-links`, `scratchpad`, `todos`, `profiles`, `search`, `templates`, `images`
- `lib/validation/` — Yup schemas, one file per resource (`daily-log`, `accomplishment`, `quick-link`, `todo`, `month-params`, `profile`)
- `lib/format/date.js` — `todayInZone`, `formatLogDate` (date-fns + date-fns-tz)
- `hooks/useAutosave.js` — debounced save status hook
- `hooks/useSlashCommands.js` — slash command detection + filtering for freeform editor
- `supabase/migrations/` — versioned SQL: 0001 profiles, 0002 core tables, 0003 search indexes, 0004 streak fn, 0005 hardening, 0006 seed-tags trigger, 0007 month_summary fn, 0008 push_subscriptions, 0009 image_attachments, 0010 day_of_week_templates
- `supabase/functions/` — Edge Functions placeholder (currently unused; bell pipeline goes through Vercel Cron path)
- `public/sw.js` — service worker: Web Push + offline shell cache + network-first fetch strategy
- `public/icons/` — PWA icons (192, 512, maskable-512) generated via sharp from inline SVG
- `app/manifest.webmanifest` — PWA manifest (display: standalone, share_target wired to `/share-in`)
- `app/share-in/route.js` — PWA Share Sheet handler; creates a quick win from shared text/URL
- `public/` — static assets
- `.github/workflows/` — CI config
- `.husky/` — pre-commit hooks
- `ROADMAP.md` — phases, risks, backlog
- `CHANGELOG.md` — backward-looking changelog (append every code change per Andrei's global rule)
- `README.md` — quick start + tech stack + scripts
- `LICENSE` — MIT
- `.env.example` — committed template; real values live in `.env.local` (gitignored)
- `.gitignore` — node_modules, env files (with `.env.example` whitelisted), build outputs, IDE folders, test artifacts
- `.prettierrc` + `.prettierignore` — formatting config
- `eslint.config.mjs` — ESLint flat config (Next.js 16 ships flat config)
- `jsconfig.json` — `@/*` import alias
- `next.config.mjs` — Next.js config; PWA wrapper added Day 6
- `package.json` — npm manifest, scripts (`dev` runs on port 3002 on this machine — 3000/3001 are taken by other projects), deps
- `postcss.config.mjs` — PostCSS config for Tailwind v4
- `proxy.js` — root-level proxy (Next.js 16 renamed middleware → proxy); refreshes Supabase session, gates `/dashboard` etc. behind sign-in
- `vercel.json` — Vercel Cron schedule (committed; activates only on deploy)
- `.gitattributes` — LF-normalize text files; binary flags for images/fonts
- `AGENTS.md` — cross-tool agent rules (mirrors this file)
- `CLAUDE.md` — this file
