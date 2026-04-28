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
- **Vercel deploy is on hold** until Andrei greenlights. Do NOT deploy without explicit go-ahead. v0.1 is verified entirely on `http://localhost:3000`.

## Aesthetic — Doctor Strange "Obsidian & Amber"

CSS vars defined in `app/globals.css`:

| Token                | Hex       | Use                               |
| -------------------- | --------- | --------------------------------- |
| `--color-background` | `#0E0B08` | Page background (near-black warm) |
| `--color-surface`    | `#1A1410` | Cards, panels (warm charcoal)     |
| `--color-text`       | `#F5E6C8` | Primary text (parchment)          |
| `--color-amber`      | `#E8A33D` | Primary accent (amber)            |
| `--color-rune-gold`  | `#C9A24C` | Subtle accent + sigil stroke      |
| `--color-crimson`    | `#B22222` | Danger / destructive only         |

- **Fonts:** Cinzel (display headers, via `next/font`) + Inter (body).
- **Sigils:** rune-styled SVG line art; never emoji for tag/category visuals. Stroke is `currentColor` so they inherit rune-gold.

## Sigils (v0.1 only)

4 starter sigils, seeded by `handle_new_user` Supabase trigger: `breakthrough`, `persistence`, `learned`, `helped_someone`. Glyphs live in `components/Sigil/glyphs/`.

**Custom user-defined tags ship in v0.2.** Do NOT add UI to manage tags in v0.1.

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
- `app/(auth)/` — public auth-related routes (sign-in, callback)
- `app/(app)/` — auth-walled routes; layout enforces `requireUser()`
- `app/api/` — route handlers (push, health)
- `components/` — PascalCase folders, each with `index.js` re-export. Co-located styles, hooks, tests
- `lib/` — Supabase clients, auth guards, validation schemas, audit, rate-limit, push helpers, formatters, structured logger
- `hooks/` — shared client hooks (autosave, theme, reduced-motion-aware)
- `tests/` — Playwright E2E + fixtures (appears Day 7)
- `supabase/migrations/` — versioned SQL migrations (appears Day 1+)
- `supabase/functions/` — Edge Functions (if any; bell uses Vercel Cron path so this may stay empty)
- `public/` — static assets (PWA icons, manifest, generated service worker)
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
- `package.json` — npm manifest, scripts, deps
- `postcss.config.mjs` — PostCSS config for Tailwind v4
- `vercel.json` — Vercel Cron schedule (committed; activates only on deploy)
- `AGENTS.md` — cross-tool agent rules (mirrors this file)
- `CLAUDE.md` — this file
