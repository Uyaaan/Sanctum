# Changelog

Notable changes to Sanctum. Format: [Keep a Changelog](https://keepachangelog.com/), versioning: [SemVer](https://semver.org/).

## [Unreleased]

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

### Notes

- Vercel deploy intentionally deferred until v0.1 is feature-complete on localhost.
- Next.js 16 breaking change handled: `middleware.js` renamed to `proxy.js`, exported function renamed `middleware` → `proxy`.
- Supabase project: `zjtepkekxfyrennpnxys` (hosted cloud, free tier). Site URL + redirect URL configured to `http://localhost:3002`.
- Dev server runs on port `3002` because `3000` and `3001` are taken by other projects on this machine (`-p 3002` flag in `dev` script).
