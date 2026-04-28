'use server';

import { redirect } from 'next/navigation';
import * as yup from 'yup';
import { requireUser } from '@/lib/auth/guards';
import { deleteDailyLog } from '@/lib/db/daily-logs';

const idSchema = yup.string().uuid().required();

export async function deleteDailyLogAction(formData) {
  const user = await requireUser();
  const id = formData.get('id') ?? '';

  try {
    idSchema.validateSync(id);
  } catch {
    return { ok: false, error: 'Invalid id' };
  }

  try {
    await deleteDailyLog({ userId: user.id, id });
  } catch {
    return { ok: false, error: 'Failed to delete entry.' };
  }

  redirect('/dashboard');
}
