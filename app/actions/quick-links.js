'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/guards';
import { createQuickLink, deleteQuickLink } from '@/lib/db/quick-links';
import { quickLinkIdSchema, quickLinkSchema } from '@/lib/validation/quick-link.schema';

export async function createQuickLinkAction(formData) {
  const user = await requireUser();
  const raw = {
    label: formData.get('label') ?? '',
    url: formData.get('url') ?? '',
  };

  let validated;
  try {
    validated = await quickLinkSchema.validate(raw, { stripUnknown: true });
  } catch (err) {
    return { ok: false, error: err.message ?? 'Invalid input' };
  }

  try {
    await createQuickLink({ userId: user.id, ...validated });
  } catch {
    return { ok: false, error: 'Failed to save link.' };
  }

  revalidatePath('/dashboard');
  return { ok: true };
}

export async function deleteQuickLinkAction(formData) {
  const user = await requireUser();
  const id = formData.get('id');

  try {
    quickLinkIdSchema.validateSync(id);
  } catch {
    return { ok: false, error: 'Invalid id' };
  }

  try {
    await deleteQuickLink({ userId: user.id, id });
  } catch {
    return { ok: false, error: 'Failed to delete link.' };
  }

  revalidatePath('/dashboard');
  return { ok: true };
}
