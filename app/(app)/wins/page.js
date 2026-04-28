import { requireUser } from '@/lib/auth/guards';
import { listAccomplishments } from '@/lib/db/accomplishments';
import { todayInZone } from '@/lib/format/date';
import { createClient } from '@/lib/supabase/server';
import { sigilFilterSchema } from '@/lib/validation/accomplishment.schema';
import { ErrorState } from '@/components/ErrorState';
import { WinsList } from '@/components/WinsList';

export default async function WinsPage({ searchParams }) {
  const params = await searchParams;
  const rawSigil = params?.sigil ?? null;
  const sigilFilter = sigilFilterSchema.isValidSync(rawSigil) ? rawSigil : null;

  const user = await requireUser();

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('sanctum_bell_timezone')
    .eq('id', user.id)
    .maybeSingle();
  const today = todayInZone(profile?.sanctum_bell_timezone ?? 'Asia/Manila');

  let wins;
  try {
    wins = await listAccomplishments({ userId: user.id, sigilKey: sigilFilter });
  } catch {
    return (
      <ErrorState
        title="Couldn't load wins"
        description="Something went wrong fetching your accomplishments. Try refreshing."
      />
    );
  }

  return <WinsList initialWins={wins} sigilFilter={sigilFilter} today={today} />;
}
