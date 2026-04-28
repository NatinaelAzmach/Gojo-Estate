import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { Property } from '@/lib/types';
import MyPropertyActions from '@/components/MyPropertyActions';

const STATUS_BADGE: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  approved:  'bg-green-100 text-green-800',
  rejected:  'bg-red-100 text-red-800',
  sold:      'bg-blue-100 text-blue-800',
  rented:    'bg-purple-100 text-purple-800',
  archived:  'bg-gray-100 text-gray-600',
};

export default async function MyPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ posted?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: listings } = await supabase
    .from('properties')
    .select('*')
    .eq('agent_id', user!.id)
    .order('created_at', { ascending: false });

  const rows = (listings ?? []) as Property[];

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Properties</h1>
          <Link href="/post-property"
            className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition">
            + Post Property
          </Link>
        </div>

        {params.posted && (
          <div className="mb-6 rounded-lg bg-teal-50 border border-teal-200 p-4 text-teal-800 text-sm">
            ✅ Your property has been submitted and is pending admin approval.
          </div>
        )}

        {rows.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium mb-2">No properties yet</p>
            <Link href="/post-property" className="text-teal-600 hover:underline text-sm">Post your first property →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Title</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Price</th>
                  <th className="px-4 py-3 text-left font-medium">City</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">{p.title}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{p.property_type} · {p.listing_type}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {p.listing_type === 'rent'
                        ? `R${(p.rent_price ?? 0).toLocaleString()}/mo`
                        : `R${p.price.toLocaleString()}`}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.city ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[p.moderation_status] ?? STATUS_BADGE[p.status]}`}>
                        {p.moderation_status === 'pending' ? 'Pending Review' : p.moderation_status === 'rejected' ? 'Rejected' : p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <MyPropertyActions property={p} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
