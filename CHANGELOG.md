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

### Notes

- Vercel deploy intentionally deferred until v0.1 is feature-complete on localhost.
- Next.js 16 breaking change handled: `middleware.js` renamed to `proxy.js`, exported function renamed `middleware` → `proxy`.
- Supabase project: `zjtepkekxfyrennpnxys` (hosted cloud, free tier). Site URL + redirect URL configured to `http://localhost:3002`.
- Dev server runs on port `3002` because `3000` and `3001` are taken by other projects on this machine (`-p 3002` flag in `dev` script).
