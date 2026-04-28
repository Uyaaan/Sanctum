# Sanctum — Roadmap

## Goals & Success Metrics

**v0.1 Goal:** A personal work dashboard Andrei opens daily, replacing nothing structured (the bar is "something I'll actually use").

**Success metrics (after 30 days of v0.1 use):**

- Daily-log streak ≥ 20 days in a 30-day window
- At least one accomplishment logged per week
- Sanctum is the dashboard tab opened first in the morning
- Monthly summary actually informs reflection (subjective)

**Non-goals for v0.1:** AI summaries, native mobile app (PWA covers it), multi-user, calendar sync, time tracking.

---

## Phases

### Phase 1 — v0.1 MVP, localhost-only (Week of 2026-04-28, 1-week timebox)

- [ ] Day 1: Foundation & Auth — sign-in via magic link works on `localhost:3000`
- [ ] Day 2: Schema & Daily Log core — write structured + freeform entries, RLS verified
- [ ] Day 3: Time Stone scrubber + Accomplishments — past-day editing, win logging with sigil tags
- [ ] Day 4: Search + Streak + Heatmap — full-text search, streak counter, year-view heatmap
- [ ] Day 5: Monthly Journal + Command Center — templated summary, quick links, scratchpad, todos
- [ ] Day 6: PWA + Sanctum Bell + Settings — installable PWA, push notification pipeline working on localhost
- [ ] Day 7: A11y, polish, tests — Playwright suite green, manual smoke clean, repo tagged `v0.1.0`

### Phase 2 — Vercel deployment (post-greenlight, no fixed date)

- [ ] Import `Uyaaan/Sanctum` into Vercel
- [ ] Copy env vars from `.env.local` to Vercel project settings
- [ ] Update Supabase Auth allowed redirect URLs from `localhost:3000` to production URL
- [ ] Push `v0.1.0` tag
- [ ] Add `@sentry/nextjs` for production error tracking, upload source maps
- [ ] Verify Vercel Cron schedule from `vercel.json` activates
- [ ] Smoke-test phone PWA install + scheduled-cron Sanctum Bell push

### Phase 3 — v0.2 backlog (no fixed dates)

- [ ] Custom user-defined tags (UI in `/settings`)
- [ ] AI-narrative monthly summary (Claude API, opt-in toggle on monthly view)
- [ ] Mandala monthly visualization (if not shipped during Day 5 of v0.1)
- [ ] Multi-user opening (re-enable Supabase signups + email allowlist policy)
- [ ] Year-in-review auto-generation
- [ ] Encrypted-at-rest journal entries (per-user key)
- [ ] Markdown rendering on freeform daily logs (currently plaintext at MVP)
- [ ] Spaced-review prompts ("3 weeks ago you wrote X — any update?")

---

## Risks & Open Questions

- **Next.js 16 + Tailwind 4 are very new.** Possible breaking-change rough edges as we build. Mitigate by reading `node_modules/next/dist/docs/` and Tailwind 4 migration guide before unfamiliar code.
- **Web Push on iOS** — Safari supports web push only when the PWA is installed on iOS 16.4+. Test path: install on phone after Phase 2 deploy, set bell, verify.
- **Vercel Cron quota on Hobby tier** — `*/5 * * * *` = 288 invocations/day. Hobby tier has historically capped this. **Mitigation**: if Hobby blocks the schedule, fall back to Supabase pg_cron + Edge Function as documented in the v0.1 plan, or coalesce to less-frequent firing windows.
- **Daily-habit success metric depends on actual use, not features.** If Sanctum isn't used after 2 weeks, retro: was the friction too high? Was there already a tool in Andrei's flow?
