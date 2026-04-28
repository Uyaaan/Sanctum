'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'sonner';
import { profileSchema } from '@/lib/validation/profile.schema';
import { updateProfileAction } from '@/app/actions/profile';

const COMMON_TIMEZONES = [
  'Asia/Manila',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
];

export function SettingsForm({ initialProfile }) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      display_name: initialProfile?.display_name ?? '',
      sanctum_bell_time: initialProfile?.sanctum_bell_time?.slice(0, 5) ?? '',
      sanctum_bell_timezone: initialProfile?.sanctum_bell_timezone ?? 'Asia/Manila',
    },
  });

  function onSubmit(data) {
    const formData = new FormData();
    formData.append('display_name', data.display_name ?? '');
    formData.append('sanctum_bell_time', data.sanctum_bell_time ?? '');
    formData.append('sanctum_bell_timezone', data.sanctum_bell_timezone ?? 'Asia/Manila');

    startTransition(async () => {
      const result = await updateProfileAction(formData);
      if (result?.ok) {
        toast.success('Settings saved.');
      } else {
        toast.error(result?.error ?? 'Failed to save.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-5" noValidate>
      <Field id="display_name" label="Display name" error={errors.display_name?.message}>
        <input
          id="display_name"
          type="text"
          {...register('display_name')}
          className="border-border bg-surface text-text placeholder-text-subtle focus:border-amber focus:ring-amber w-full rounded border px-3 py-2 text-sm transition-colors outline-none focus:ring-1"
          placeholder="What should Sanctum call you?"
        />
      </Field>

      <Field
        id="sanctum_bell_time"
        label="Sanctum Bell time"
        error={errors.sanctum_bell_time?.message}
        hint="When should the daily reminder fire? Leave empty to disable."
      >
        <input
          id="sanctum_bell_time"
          type="time"
          {...register('sanctum_bell_time')}
          className="border-border bg-surface text-text focus:border-amber focus:ring-amber rounded border px-3 py-2 text-sm transition-colors outline-none focus:ring-1"
        />
      </Field>

      <Field
        id="sanctum_bell_timezone"
        label="Bell timezone"
        error={errors.sanctum_bell_timezone?.message}
      >
        <select
          id="sanctum_bell_timezone"
          {...register('sanctum_bell_timezone')}
          className="border-border bg-surface text-text focus:border-amber focus:ring-amber w-full rounded border px-3 py-2 text-sm transition-colors outline-none focus:ring-1"
        >
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </Field>

      <button
        type="submit"
        disabled={isSubmitting || isPending || !isDirty}
        className="bg-amber text-background hover:bg-amber/90 rounded px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending || isSubmitting ? 'Saving…' : 'Save settings'}
      </button>
    </form>
  );
}

function Field({ id, label, error, hint, children }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-text-muted block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-text-subtle text-xs">{hint}</p>}
      {error && (
        <p className="text-crimson text-xs" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
