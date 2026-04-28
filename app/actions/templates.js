'use server';

import { revalidatePath } from 'next/cache';
import * as yup from 'yup';
import { requireUser } from '@/lib/auth/guards';
import { upsertTemplate } from '@/lib/db/templates';

const templateSchema = yup.object({
  weekday: yup.number().integer().min(0).max(6).required(),
  what_i_did: yup.string().max(2000).default(''),
  wins: yup.string().max(2000).default(''),
  blockers: yup.string().max(2000).default(''),
  tomorrow: yup.string().max(2000).default(''),
});

export async function upsertTemplateAction(formData) {
  const user = await requireUser();

  const raw = {
    weekday: parseInt(formData.get('weekday') ?? '0', 10),
    what_i_did: formData.get('what_i_did') ?? '',
    wins: formData.get('wins') ?? '',
    blockers: formData.get('blockers') ?? '',
    tomorrow: formData.get('tomorrow') ?? '',
  };

  let validated;
  try {
    validated = await templateSchema.validate(raw, { stripUnknown: true });
  } catch (err) {
    return { ok: false, error: err.message ?? 'Invalid input' };
  }

  const { weekday, ...content } = validated;

  try {
    await upsertTemplate({ userId: user.id, weekday, content });
  } catch {
    return { ok: false, error: 'Failed to save template.' };
  }

  revalidatePath('/settings');
  return { ok: true };
}
