import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/guards';
import { createAccomplishment } from '@/lib/db/accomplishments';
import { todayInZone } from '@/lib/format/date';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const text =
    searchParams.get('text') || searchParams.get('url') || searchParams.get('title') || '';

  if (text.trim()) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('sanctum_bell_timezone')
      .eq('id', user.id)
      .maybeSingle();

    const today = todayInZone(profile?.sanctum_bell_timezone ?? 'Asia/Manila');

    await createAccomplishment({
      userId: user.id,
      text: text.slice(0, 2000),
      sigilKey: null,
      occurredOn: today,
    }).catch(() => {});
  }

  redirect('/wins');
}
