import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import ProfileForm from '@/components/ProfileForm';
import { Profile } from '@/lib/types';

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  agent: 'bg-teal-100 text-teal-700',
  user:  'bg-gray-100 text-gray-700',
};

export default async function ProfilePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Use service role to avoid RLS recursion
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: profile } = await admin
    .from('profiles').select('*').eq('id', user.id).single<Profile>();

  if (!profile) redirect('/login');

  const badgeClass = ROLE_BADGE[profile.role] ?? 'bg-gray-100 text-gray-700';

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-sm text-gray-500">{user.email}</span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${badgeClass}`}>
              {profile.role}
            </span>
          </div>
        </div>
        <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-6">
          <ProfileForm initialProfile={profile} />
        </div>
      </div>
    </main>
  );
}
