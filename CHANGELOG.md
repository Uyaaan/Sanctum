# Changelog

Notable changes to Sanctum. Format: [Keep a Changelog](https://keepachangelog.com/), versioning: [SemVer](https://semver.org/).

## [Unreleased]

(no unreleased changes)

## [0.1.0] - 2026-04-28

**v0.1 MVP — localhost-only.** Daily log + accomplishments + monthly journal + command center, all wired against Supabase with RLS, full-text search, streak counter, year heatmap, and a Web Push pipeline ready for Vercel Cron post-deploy.

### Added

- Project scaffolded via `create-next-app@latest` (Next.js 16.2.4, React 19.2.4, Tailwind v4, ESLint 9, Turbopack dev)
- Project files: `ROADMAP.md`, `CLAUDE.md`, `AGENTS.md`, `README.md`, `CHANGELOG.md`, `LICENSE` (MIT), `.env.example`, `vercel.json`
- Prettier config (`.prettierrc`, `.prettierignore`) and `.gitattributes` (LF normalization)
- Pre-commit hooks: Husky v9 + lint-staged + Secretlint (`@secretlint/secretlint-rule-preset-recommend`) blocking secret commits
- GitHub Actions CI workflow (`.github/workflows/ci.yml`)
- Git remote configured to `https://github.com/Uyaaan/Sanctum.git`; branch `main`; local git author set to `Uyaaan <uyanqwerty@gmail.com>`

- Supabase clients (`lib/supabase/{client,server}.js`), `proxy.js` session refresh (Next.js 16 renamed middleware → proxy), and `lib/auth/guards.js`
- Magic-link sign-in page (`/sign-in`), auth callback route (`/auth/callback`), protected `(app)` layout with `requireUser()` guard, placeholder `/dashboard`
- Sanctum palette + Cinzel/Inter fonts wired in `app/globals.css` and `app/layout.js`
- `supabase/migrations/0001_profiles.sql` — profiles table, RLS policies, `handle_new_user` trigger, `set_updated_at` helper

#### Day 2 — Schema & Daily Log core

- Migrations applied:
  - `0002_core_tables.sql` — `daily_logs`, `accomplishments`, `tags`, `entry_tags`, `accomplishment_tags`, `quick_links`, `scratchpad`, `todos`, `audit_logs` with full RLS policies (SELECT/INSERT/UPDATE/DELETE on owned rows)
  - `0003_search_indexes.sql` — `pg_trgm` extension + generated `tsvector` columns + GIN indexes on `daily_logs.content_md` and `accomplishments.text`
  - `0004_streak_function.sql` — `current_streak(user_id, today)` SQL function (counts consecutive non-empty daily logs)
  - `0005_security_hardening.sql` — pinned `search_path` on `set_updated_at` and `current_streak`; revoked EXECUTE on `handle_new_user` from anon/authenticated/PUBLIC
  - `0006_seed_tags_trigger.sql` — `handle_new_user` now also creates a `scratchpad` row and seeds the 4 starter sigil tags (Breakthrough, Persistence, Learned, Helped Someone). Backfilled the same data for existing users.
- Component primitives: `<RuneDivider>`, `<Skeleton>`, `<EmptyState>`, `<ErrorState>`, `<Sigil name="...">` with 4 SVG glyphs in `components/Sigil/glyphs/`
- `<DailyLog>` server component fetches today's row (auto-creates if missing) and renders `<DailyLogEditor>` (client) with structured/freeform mode toggle and 800ms-debounced autosave (`hooks/useAutosave.js`)
- `lib/db/daily-logs.js` — `getDailyLog`, `getOrCreateDailyLog`
- `lib/format/date.js` — `todayInZone`, `formatLogDate` (uses `date-fns` + `date-fns-tz`)
- `lib/validation/daily-log.schema.js` — Yup schemas for structured / freeform / mode / date params
- `/dashboard` now renders today's daily log with the user's local-timezone date (defaults to `Asia/Manila` from `profiles.sanctum_bell_timezone`) plus a Command Center placeholder column

#### Day 3 — Time Stone scrubber + Accomplishments

- `<DateScrubber>` component on the daily log header — prev/next chevrons, native `<input type="date">` calendar picker (max-capped at today), Today button. Routes to `/dashboard` for today and `/log/[date]` for past days.
- `/log/[date]` route — reuses `<DailyLog>` to time-travel; rejects future dates and malformed params via `dateParamSchema`. Auto-creates an empty row for past days via `getOrCreateDailyLog`.
- Shared `(app)` layout now hosts the Sanctum header + `Wins` nav link + `<QuickWin>` floating action button on every authenticated page.
- `<QuickWin>` FAB — Radix Dialog with text + sigil tag picker + date input, react-hook-form + Yup, calls a server action.
- `app/actions/accomplishments.js` — `createAccomplishmentAction` server action (Yup validation, `revalidatePath` of `/wins` and `/dashboard`).
- `lib/db/accomplishments.js` — `createAccomplishment` (inserts win + optional sigil-tag join row), `listAccomplishments` (server-filterable by sigil_key via `!inner` join).
- `lib/validation/accomplishment.schema.js` — Yup schemas for win input + sigil filter param.
- `/wins` route — list view with sigil-filter chips, empty state, error state. Uses `searchParams.sigil` for filtering.
- Sonner `<Toaster>` mounted in root layout (top-right, dark theme, palette-tinted). Toasts fire on win-saved success and on save errors.

#### Day 4 — Search + Streak + Heatmap

- `/search` route — server-rendered, GET form posts back to `/search?q=…`, runs `websearch_to_tsquery`-style match against `daily_logs.search_tsv` and `accomplishments.search_tsv` via Supabase `.textSearch()`.
- `<SearchResults>` — grouped by Daily Log + Wins, highlights matched terms with `<mark>`, snippet preview windows around the match, links into `/log/[date]` for source entries.
- `lib/db/search.js` — `searchAll(userId, query)` returns `{ logs, wins }` newest-first.
- `<StreakBadge>` — server component, calls `current_streak` RPC, renders flame glyph + day count in the (app) layout header. Hidden when streak is 0.
- `<HeatmapCalendar>` — server component, hand-rolled 53×7 SVG GitHub-style grid for the last 365 days. Intensity bucketed 0–4 from log char count + win count. Today cell stroked. Native `<title>` tooltips per cell. Mounted at the top of `/dashboard`.
- (app) layout nav now includes `Search` link in addition to `Wins`.

#### Day 5a — Monthly Journal

- Migration `0007_month_summary_function.sql` — `month_summary(user_id, year, month)` SQL function returns a JSONB blob: `month_label`, `entry_count`, `win_count`, `longest_streak_in_month` (gaps-and-islands), `top_tags` (top 5), `weeks` (entries grouped by week_start with 240-char previews), `wins` (with sigil_keys arrays).
- `/journal/[year]/[month]` route — server-fetches the RPC, renders `<MonthBrowser>` (prev/next nav with future-month disabled) and `<MonthSummary>` (stats grid, top sigils, wins list, weekly echo).
- `lib/validation/month-params.schema.js` — Yup schema validating year (2020–2100) and month (1–12).
- `Journal` nav link added to (app) layout, defaulting to current YYYY/MM.

#### Day 5b — Command Center

- `<CommandCenter>` server component fetches `quick_links`, `scratchpad`, and `todos` in parallel; passes to `<CommandCenterTabs>` (client) — Radix Tabs with three panels.
- `<QuickLinksPanel>` — react-hook-form + Yup add form, list of pinned links opening in new tabs, delete with `window.confirm`.
- `<ScratchpadPanel>` — single plaintext textarea with 1500ms-debounced autosave via `useAutosave` and `updateScratchpadAction`.
- `<TodoListPanel>` — add form, active list + collapsible Done section, optimistic toggle, delete with confirm.
- Server actions: `app/actions/quick-links.js` (create/delete), `app/actions/scratchpad.js` (upsert), `app/actions/todos.js` (create/toggle/delete).
- DB helpers: `lib/db/quick-links.js`, `lib/db/scratchpad.js`, `lib/db/todos.js`.
- Validation: `quick-link.schema.js` (label + URL https-only), `todo.schema.js` (1–500 chars).
- `/dashboard` sidebar replaced with the live `<CommandCenter>` (340px column on lg+).
- `/log/[date]` simplified to full-width daily log (Command Center stays on /dashboard).

#### Day 6 — Settings + Sanctum Bell

- Migration `0008_push_subscriptions.sql` — `push_subscriptions` table with `endpoint UNIQUE`, RLS policies (select/insert/delete on own rows).
- VAPID keys generated and saved to `.env.local` (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`).
- `/settings` page — `<SettingsForm>` (display name, bell time, bell timezone via dropdown of common IANA zones) + `<PushSubscribeButton>` (subscribe / unsubscribe / send test push).
- `lib/db/profiles.js` — `getProfile` + `updateProfile`.
- `lib/supabase/admin.js` — `createAdminClient` for service-role server-only operations (Vercel Cron tick).
- `lib/validation/profile.schema.js` — Yup schemas for profile + push subscription payloads.
- Server action: `app/actions/profile.js#updateProfileAction`.
- Server action: `app/actions/push.js#sendTestPushAction` — fires a test push to the current user's subscriptions; auto-prunes 404/410 (stale) endpoints.
- API routes:
  - `POST /api/push/subscribe` — auth-gated, upserts a push subscription row by endpoint.
  - `POST /api/push/unsubscribe` — auth-gated, deletes the row by endpoint.
  - `POST /api/push/tick` — `CRON_SECRET` Bearer-gated; admin-client query of profiles whose local time is within ±2 min of `sanctum_bell_time`; web-push dispatch with `web-push` package; auto-prunes stale subscriptions on 404/410.
- `public/sw.js` — service worker handling `push` (showNotification with sanctum-bell tag) and `notificationclick` (focus-or-open `/dashboard`).
- `Settings` nav link added to (app) layout.

### Deferred (not in v0.1)

- Playwright E2E suite — framework not yet installed; backfilled in v0.2 polish pass.
- PWA install (manifest + 192/512 icons) — service worker is registered for push, but app is not yet installable to home screen.
- AI-narrative monthly summary — month_summary RPC does templated aggregation only; AI add-on planned for v0.2.
- Mandala monthly visualization — feature-flag gate not added; deferred to v0.2.
- Custom user-defined tags UI — schema supports it, no UI yet (sigils only for v0.1).
- Sentry error tracking — defer to deploy time.

### Notes

- Vercel deploy intentionally deferred until v0.1 is feature-complete on localhost.
- Next.js 16 breaking change handled: `middleware.js` renamed to `proxy.js`, exported function renamed `middleware` → `proxy`.
- Supabase project: `zjtepkekxfyrennpnxys` (hosted cloud, free tier). Site URL + redirect URL configured to `http://localhost:3002`.
- Dev server runs on port `3002` because `3000` and `3001` are taken by other projects on this machine (`-p 3002` flag in `dev` script).
