'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createClient } from '@/lib/supabase/client';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
});

export default function SignInPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  async function onSubmit({ email }) {
    setServerError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      setServerError('Something went wrong. Please try again.');
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="font-display text-amber text-2xl">The sanctum awaits.</h1>
          <p className="text-text-muted text-sm">
            A magic link has been sent to your email. Click it to enter Sanctum.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-1 text-center">
          <h1 className="font-display text-amber text-3xl font-semibold">Sanctum</h1>
          <p className="text-text-subtle text-sm">Your personal work dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-text-muted block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              className="border-border bg-surface text-text placeholder-text-subtle focus:border-amber focus:ring-amber w-full rounded border px-3 py-2 text-sm transition-colors outline-none focus:ring-1"
              placeholder="you@example.com"
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="text-crimson text-xs">
                {errors.email.message}
              </p>
            )}
          </div>

          {serverError && (
            <p role="alert" className="text-crimson text-sm">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-amber text-background w-full rounded py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Sending…' : 'Send magic link'}
          </button>
        </form>
      </div>
    </div>
  );
}
