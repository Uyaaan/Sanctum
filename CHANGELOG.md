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

### Notes

- Vercel deploy intentionally deferred until v0.1 is feature-complete on localhost.
- Supabase, magic-link auth, RLS schema, daily log, accomplishments, monthly journal, command center, PWA, and Sanctum Bell — coming in subsequent commits.
