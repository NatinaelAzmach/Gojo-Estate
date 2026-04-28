import { createClient } from '@supabase/supabase-js';
import AdminPropertyGrid from '@/components/admin/AdminPropertyGrid';
import { Property } from '@/lib/types';

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab ?? 'pending';

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all listings with owner profile info
  const { data: listings } = await supabase
    .from('properties')
    .select('*, profiles(full_name, avatar_url)')
    .order('created_at', { ascending: false });

  const all = (listings ?? []) as (Property & { profiles: { full_name: string | null } | null })[];

  const tabs = ['pending', 'approved', 'rejected', 'sold', 'rented'] as const;

  const filtered = tab === 'all'
    ? all
    : all.filter(p => {
        if (tab === 'pending') return p.moderation_status === 'pending';
        if (tab === 'approved') return p.moderation_status === 'approved' && p.status === 'available';
        if (tab === 'rejected') return p.moderation_status === 'rejected';
        if (tab === 'sold') return p.status === 'sold';
        if (tab === 'rented') return p.status === 'rented';
        return true;
      });

  const counts = {
    pending:  all.filter(p => p.moderation_status === 'pending').length,
    approved: all.filter(p => p.moderation_status === 'approved' && p.status === 'available').length,
    rejected: all.filter(p => p.moderation_status === 'rejected').length,
    sold:     all.filter(p => p.status === 'sold').length,
    rented:   all.filter(p => p.status === 'rented').length,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Manage Properties</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <a key={t} href={`/admin/properties?tab=${t}`}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t}
            {counts[t] > 0 && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                t === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {counts[t]}
              </span>
            )}
          </a>
        ))}
      </div>

      <AdminPropertyGrid listings={filtered as Property[]} />
    </div>
  );
}
