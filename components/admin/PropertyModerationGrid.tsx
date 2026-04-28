'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Property } from '@/lib/types';
import { moderateListing } from '@/actions/admin';
import { archiveListing, deleteListing } from '@/actions/listings';

const PAGE_SIZE = 10;

export default function PropertyModerationGrid({
  initialListings,
}: {
  initialListings: Property[];
}) {
  const router = useRouter();
  const [listings, setListings] = useState(initialListings);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = listings.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleModerate(id: string, status: 'approved' | 'rejected') {
    setLoadingId(id);
    await moderateListing(id, status);
    setLoadingId(null);
    router.refresh();
  }

  async function handleArchive(id: string) {
    setLoadingId(id);
    await archiveListing(id);
    setLoadingId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    setLoadingId(id);
    await deleteListing(id);
    setListings((prev) => prev.filter((l) => l.id !== id));
    setLoadingId(null);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-[#0f1f3d] text-white">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Price</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Moderation</th>
              <th className="px-4 py-3 text-left font-medium">Agent ID</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  No listings found.
                </td>
              </tr>
            ) : (
              paginated.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate">
                    {listing.title}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    ${listing.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        listing.moderation_status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : listing.moderation_status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {listing.moderation_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono truncate max-w-[120px]">
                    {listing.agent_id}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <button
                        onClick={() => handleModerate(listing.id, 'approved')}
                        disabled={loadingId === listing.id}
                        className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleModerate(listing.id, 'rejected')}
                        disabled={loadingId === listing.id}
                        className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleArchive(listing.id)}
                        disabled={loadingId === listing.id}
                        className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                      >
                        Archive
                      </button>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        disabled={loadingId === listing.id}
                        className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2 justify-end">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
