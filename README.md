# Sanctum

A personal work dashboard. Daily log, accomplishments, monthly journal, command center. Doctor Strange-flavored.

## Tech stack

- **Frontend & API:** Next.js 16 (App Router), JavaScript, React 19
- **Styling:** Tailwind v4 (CSS-first config) + Cinzel + Inter
- **Database & Auth:** Supabase (Postgres + magic-link auth)
- **PWA:** `@serwist/next` + Web Push (VAPID)
- **Icons:** Phosphor (`@phosphor-icons/react`)
- **Hosting:** Vercel (deferred until v0.1 ready)

## Setup

```bash
git clone https://github.com/Uyaaan/Sanctum.git
cd Sanctum
npm install
cp .env.example .env.local
# Fill in .env.local with your Supabase + VAPID keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Script                | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `npm run dev`         | Local dev server with Turbopack at port 3000 |
| `npm run build`       | Production build                             |
| `npm run start`       | Run the production build                     |
| `npm run lint`        | ESLint check                                 |
| `npx playwright test` | Run E2E tests (added Day 7)                  |

## Environment variables

See [`.env.example`](.env.example) for the full list. At minimum you need:

- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, admin Supabase key
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` + `VAPID_SUBJECT` — Web Push (Sanctum Bell)
- `CRON_SECRET` — gates the `/api/push/tick` route

Generate VAPID keys with `npx web-push generate-vapid-keys`. `CRON_SECRET` can be any random 32+ char string.

## Folder structure

See [CLAUDE.md](CLAUDE.md) for the full annotated map.

## Deployment (deferred)

v0.1 is verified on `http://localhost:3000` only. When deployment is greenlit:

1. Import `Uyaaan/Sanctum` into a Vercel project
2. Copy env vars from `.env.local` to Vercel project settings
3. Add the production URL to Supabase Auth allowed redirect URLs (Auth → URL Configuration)
4. Push `v0.1.0` tag (`git push origin v0.1.0`)
5. Install `@sentry/nextjs` and upload source maps
6. Verify Vercel Cron schedule from `vercel.json` activated (Settings → Cron Jobs)
7. Smoke-test phone PWA install + scheduled-cron Sanctum Bell push

## License

[MIT](LICENSE)
