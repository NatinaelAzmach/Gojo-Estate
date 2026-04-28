'use server';

import { ActionResult } from '@/lib/types';
import { createServerClient } from '@/lib/supabase/server';

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const full_name = formData.get('full_name') as string;
    const avatarFile = formData.get('avatar') as File;

    let avatar_url: string | undefined;

    if (avatarFile && avatarFile.size > 0) {
      const ext = avatarFile.name.split('.').pop();
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true });

      if (uploadError) {
        return { success: false, error: `Avatar upload failed: ${uploadError.message}` };
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      avatar_url = urlData.publicUrl;
    }

    const updatePayload = avatar_url
      ? { full_name, avatar_url }
      : { full_name };

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
