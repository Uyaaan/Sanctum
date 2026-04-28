import { createClient } from '@/lib/supabase/server';

export async function createImageAttachment({
  userId,
  dailyLogId,
  storagePath,
  altText,
  width,
  height,
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('image_attachments')
    .insert({
      user_id: userId,
      daily_log_id: dailyLogId ?? null,
      storage_path: storagePath,
      alt_text: altText ?? null,
      width: width ?? null,
      height: height ?? null,
    })
    .select('id, storage_path')
    .single();
  if (error) throw error;
  return data;
}

export async function getSignedImageUrl(storagePath) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from('daily-log-images')
    .createSignedUrl(storagePath, 3600);
  if (error) throw error;
  return data.signedUrl;
}
