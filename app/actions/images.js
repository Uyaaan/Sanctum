'use server';

import sharp from 'sharp';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { createImageAttachment, getSignedImageUrl } from '@/lib/db/images';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadImageAction(formData) {
  const user = await requireUser();

  const file = formData.get('image');
  const dailyLogId = formData.get('daily_log_id') || null;

  if (!file || typeof file === 'string') {
    return { ok: false, error: 'No file received.' };
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, error: 'Only JPEG, PNG, and WebP images are supported.' };
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, error: 'Image must be under 5 MB.' };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Strip EXIF metadata and convert to WebP for consistency
  let processed;
  let meta;
  try {
    const image = sharp(buffer).rotate(); // auto-rotate based on EXIF, then strip
    meta = await image.metadata();
    processed = await image.webp({ quality: 85 }).toBuffer();
  } catch {
    return { ok: false, error: 'Failed to process image.' };
  }

  const filename = `${user.id}/${Date.now()}.webp`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from('daily-log-images')
    .upload(filename, processed, { contentType: 'image/webp', upsert: false });

  if (uploadError) {
    return { ok: false, error: 'Failed to upload image.' };
  }

  let attachment;
  try {
    attachment = await createImageAttachment({
      userId: user.id,
      dailyLogId,
      storagePath: filename,
      altText: file.name ?? null,
      width: meta.width ?? null,
      height: meta.height ?? null,
    });
  } catch {
    return { ok: false, error: 'Failed to record attachment.' };
  }

  let signedUrl;
  try {
    signedUrl = await getSignedImageUrl(filename);
  } catch {
    return { ok: false, error: 'Upload succeeded but could not generate URL.' };
  }

  return { ok: true, url: signedUrl, storagePath: filename, id: attachment.id };
}
