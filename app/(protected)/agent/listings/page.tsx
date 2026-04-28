import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { Property } from '@/lib/types';
import DeleteListingButton from '@/components/agent/DeleteListingButton';

export default async function AgentListingsPage() {
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-navy-brand">My Listings</h1>
          <Link href="/agent/listings/new"
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors">
            + Create New Listing
          </Link>
        </div>

        {rows.length === 0 ? (
          <p className="text-gray-500 text-sm">You have no listings yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Title</th>
                  <th className="px-4 py-3 text-left font-semibold">Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Moderation</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{listing.title}</td>
                    <td className="px-4 py-3 text-gray-700">${listing.price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize bg-teal-100 text-teal-800">
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        listing.moderation_status === 'approved' ? 'bg-green-100 text-green-800'
                        : listing.moderation_status === 'rejected' ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {listing.moderation_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/agent/listings/${listing.id}/edit`}
                          className="rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700 transition-colors">
                          Edit
                        </Link>
                        <DeleteListingButton listingId={listing.id} />
                      </div>
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
