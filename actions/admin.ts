'use server';

import { createClient } from '@supabase/supabase-js';
import { ActionResult, ModerationStatus, UserRole } from '@/lib/types';
import { createServerClient } from '@/lib/supabase/server';

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function verifyAdmin(): Promise<{ userId: string } | ActionResult> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return { success: false, error: 'Could not fetch user profile' };
  }

  if (profile.role !== 'admin') {
    return { success: false, error: 'Forbidden: admin access required' };
  }

  return { userId: user.id };
}

export async function moderateListing(
  id: string,
  status: ModerationStatus
): Promise<ActionResult> {
  try {
    const check = await verifyAdmin();
    if ('error' in check) return check;

    const supabase = await createServerClient();
    const { error } = await supabase
      .from('properties')
      .update({ moderation_status: status })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<ActionResult> {
  try {
    const check = await verifyAdmin();
    if ('error' in check) return check;

    const supabase = await createServerClient();
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

export async function banUser(userId: string): Promise<ActionResult> {
  try {
    const check = await verifyAdmin();
    if ('error' in check) return check;

    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      ban_duration: '876600h',
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  try {
    const check = await verifyAdmin();
    if ('error' in check) return check;

    const supabase = await createServerClient();
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) return { success: false, error: profileError.message };

    const adminClient = createAdminClient();
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId);

    if (authError) return { success: false, error: authError.message };
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
