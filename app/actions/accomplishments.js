'use server';

import { revalidatePath } from 'next/cache';
import * as yup from 'yup';
import { requireUser } from '@/lib/auth/guards';
import {
  createAccomplishment,
  updateAccomplishment,
  deleteAccomplishment,
} from '@/lib/db/accomplishments';
import { accomplishmentSchema } from '@/lib/validation/accomplishment.schema';

const idSchema = yup.string().uuid().required();

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

export async function updateAccomplishmentAction(formData) {
  const user = await requireUser();

  const id = formData.get('id') ?? '';
  try {
    idSchema.validateSync(id);
  } catch {
    return { ok: false, error: 'Invalid id' };
  }

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
    await updateAccomplishment({
      userId: user.id,
      id,
      text: validated.text,
      sigilKey: validated.sigil_key,
      occurredOn: validated.occurred_on,
    });
  } catch {
    return { ok: false, error: 'Failed to update win.' };
  }

  revalidatePath('/wins');
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function deleteAccomplishmentAction(formData) {
  const user = await requireUser();

  const id = formData.get('id') ?? '';
  try {
    idSchema.validateSync(id);
  } catch {
    return { ok: false, error: 'Invalid id' };
  }

  try {
    await deleteAccomplishment({ userId: user.id, id });
  } catch {
    return { ok: false, error: 'Failed to delete win.' };
  }

  revalidatePath('/wins');
  revalidatePath('/dashboard');
  return { ok: true };
}
