import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function requireUser({ redirectTo = '/sign-in' } = {}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(redirectTo);
  }

  return user;
}
