import { createClient } from '@/lib/supabase/server';

export async function getProfile(userId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, sanctum_bell_time, sanctum_bell_timezone, theme_preference')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile({
  userId,
  displayName,
  bellTime,
  bellTimezone,
  themePreference,
}) {
  const supabase = await createClient();
  const updates = {};
  if (displayName !== undefined) updates.display_name = displayName;
  if (bellTime !== undefined) updates.sanctum_bell_time = bellTime;
  if (bellTimezone !== undefined) updates.sanctum_bell_timezone = bellTimezone;
  if (themePreference !== undefined) updates.theme_preference = themePreference;

  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
  if (error) throw error;
}
