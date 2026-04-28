'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/guards';
import { updateProfile } from '@/lib/db/profiles';
import { profileSchema } from '@/lib/validation/profile.schema';

export async function updateProfileAction(formData) {
  const user = await requireUser();
  const raw = {
    display_name: formData.get('display_name') ?? '',
    sanctum_bell_time: formData.get('sanctum_bell_time') ?? '',
    sanctum_bell_timezone: formData.get('sanctum_bell_timezone') || 'Asia/Manila',
  };

  let validated;
  try {
    validated = await profileSchema.validate(raw, { stripUnknown: true });
  } catch (err) {
    return { ok: false, error: err.message ?? 'Invalid input' };
  }

  try {
    await updateProfile({
      userId: user.id,
      displayName: validated.display_name,
      bellTime: validated.sanctum_bell_time,
      bellTimezone: validated.sanctum_bell_timezone,
    });
  } catch {
    return { ok: false, error: 'Failed to save profile.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/settings');
  return { ok: true };
}
