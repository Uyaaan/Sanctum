import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const redirectTo = new URL(next, url.origin);
      // Safety: only allow relative redirects to prevent open redirects
      if (redirectTo.origin === url.origin) {
        return NextResponse.redirect(redirectTo);
      }
      return NextResponse.redirect(new URL('/dashboard', url.origin));
    }
  }

  // Auth failed — send back to sign-in with an error hint
  return NextResponse.redirect(new URL('/sign-in?error=1', url.origin));
}
