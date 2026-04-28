import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  const user = await requireUser();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const endpoint = body?.endpoint;
  if (typeof endpoint !== 'string' || !endpoint.startsWith('http')) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
  }

  const supabase = await createClient();
  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint);

  return NextResponse.json({ ok: true });
}
