'use server';

import { requireUser } from '@/lib/auth/guards';
import { updateScratchpad } from '@/lib/db/scratchpad';

const MAX_BODY = 100_000;

export async function updateScratchpadAction(formData) {
  const user = await requireUser();
  const body = formData.get('body') ?? '';

  if (typeof body !== 'string' || body.length > MAX_BODY) {
    return { ok: false, error: 'Invalid input' };
  }

  try {
    await updateScratchpad({ userId: user.id, body });
  } catch {
    return { ok: false, error: 'Failed to save.' };
  }

  return { ok: true };
}
