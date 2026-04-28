'use server';

import webpush from 'web-push';
import { requireUser } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';

const PAYLOAD = JSON.stringify({
  title: 'Sanctum Bell — test',
  body: 'If you can read this, the bell works.',
  url: '/dashboard',
});

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;

if (VAPID_PUBLIC && VAPID_PRIVATE && VAPID_SUBJECT) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

export async function sendTestPushAction() {
  const user = await requireUser();

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return { ok: false, error: 'VAPID keys not configured on the server.' };
  }

  const supabase = await createClient();
  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth_key')
    .eq('user_id', user.id);

  if (error) return { ok: false, error: 'Failed to look up subscriptions.' };
  if (!subs || subs.length === 0) {
    return { ok: false, error: 'No subscription found. Subscribe first.' };
  }

  let dispatched = 0;
  const stale = [];

  await Promise.all(
    subs.map(async (sub) => {
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
    await supabase.from('push_subscriptions').delete().in('id', stale);
  }

  return { ok: true, dispatched };
}
