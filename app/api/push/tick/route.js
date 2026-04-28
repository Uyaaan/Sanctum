import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createAdminClient } from '@/lib/supabase/admin';

const PAYLOAD = JSON.stringify({
  title: 'Sanctum Bell',
  body: 'The day is closing. What did you do?',
  url: '/dashboard',
});

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;

if (VAPID_PUBLIC && VAPID_PRIVATE && VAPID_SUBJECT) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

export async function POST(request) {
  const auth = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 });
  }

  const admin = createAdminClient();

  // Find profiles whose local time is within ±2 minutes of their sanctum_bell_time
  const { data: profiles, error: profilesError } = await admin
    .from('profiles')
    .select('id, sanctum_bell_time, sanctum_bell_timezone')
    .not('sanctum_bell_time', 'is', null);

  if (profilesError) {
    return NextResponse.json({ error: 'Profile fetch failed' }, { status: 500 });
  }

  const now = new Date();
  const matchedUserIds = [];

  for (const p of profiles ?? []) {
    if (!p.sanctum_bell_time || !p.sanctum_bell_timezone) continue;
    const localNow = new Intl.DateTimeFormat('en-US', {
      timeZone: p.sanctum_bell_timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now);
    const [hh, mm] = localNow.split(':').map(Number);
    const [bellH, bellM] = p.sanctum_bell_time.split(':').map(Number);
    const nowMin = hh * 60 + mm;
    const bellMin = bellH * 60 + bellM;
    if (Math.abs(nowMin - bellMin) <= 2) {
      matchedUserIds.push(p.id);
    }
  }

  if (matchedUserIds.length === 0) {
    return NextResponse.json({ ok: true, matched: 0, dispatched: 0 });
  }

  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth_key')
    .in('user_id', matchedUserIds);

  let dispatched = 0;
  const stale = [];

  await Promise.all(
    (subs ?? []).map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth_key },
          },
          PAYLOAD,
        );
        dispatched += 1;
      } catch (err) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          stale.push(sub.id);
        }
      }
    }),
  );

  if (stale.length > 0) {
    await admin.from('push_subscriptions').delete().in('id', stale);
  }

  return NextResponse.json({
    ok: true,
    matched: matchedUserIds.length,
    dispatched,
    pruned: stale.length,
  });
}
