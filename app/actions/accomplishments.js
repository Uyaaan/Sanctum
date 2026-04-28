'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/guards';
import { createAccomplishment } from '@/lib/db/accomplishments';
import { accomplishmentSchema } from '@/lib/validation/accomplishment.schema';

export async function createAccomplishmentAction(formData) {
  const user = await requireUser();

  const raw = {
    text: formData.get('text') ?? '',
    sigil_key: formData.get('sigil_key') || null,
    occurred_on: formData.get('occurred_on') ?? '',
  };

  let validated;
  try {
    validated = await accomplishmentSchema.validate(raw, { stripUnknown: true });
  } catch (err) {
    return { ok: false, error: err.message ?? 'Invalid input' };
  }

  try {
    await createAccomplishment({
      userId: user.id,
      text: validated.text,
      sigilKey: validated.sigil_key,
      occurredOn: validated.occurred_on,
    });
  } catch {
    return { ok: false, error: 'Failed to save win.' };
  }

  revalidatePath('/wins');
  revalidatePath('/dashboard');

  return { ok: true };
}
