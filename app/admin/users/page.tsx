import { createClient } from '@supabase/supabase-js';
import UserGrid from '@/components/admin/UserGrid';
import { Profile } from '@/lib/types';

export default async function AdminUsersPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: profiles } = await supabase
    .from('profiles').select('*').order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Users</h1>
      <UserGrid initialProfiles={(profiles as Profile[]) ?? []} />
    </div>
  );
}
