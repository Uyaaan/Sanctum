import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { pushSubscriptionSchema } from '@/lib/validation/profile.schema';

export async function POST(request) {
  const user = await requireUser();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  let validated;
  try {
    validated = await pushSubscriptionSchema.validate(body, { stripUnknown: true });
  } catch (err) {
    return NextResponse.json({ error: err.message ?? 'Invalid' }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint: validated.endpoint,
      p256dh: validated.p256dh,
      auth_key: validated.auth_key,
      user_agent: validated.user_agent ?? null,
    },
    { onConflict: 'endpoint' },
  );

  if (error) {
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
