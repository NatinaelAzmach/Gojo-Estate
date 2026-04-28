'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/browser';
import type { Property } from '@/lib/types';

const STATUS_BADGE: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  sold:     'bg-blue-100 text-blue-800',
  rented:   'bg-purple-100 text-purple-800',
};

export default function AdminPropertyGrid({ listings }: { listings: Property[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = listings.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.city ?? '').toLowerCase().includes(search.toLowerCase())
  );

  async function action(id: string, updates: Record<string, unknown>) {
    setLoadingId(id);
    const supabase = createBrowserClient();
    await supabase.from('properties').update(updates).eq('id', id);
    setLoadingId(null);
    startTransition(() => router.refresh());
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this property permanently?')) return;
    setLoadingId(id);
    const supabase = createBrowserClient();
    await supabase.from('properties').delete().eq('id', id);
    setLoadingId(null);
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <div className="mb-4">
        <input type="text" placeholder="Search by title or city…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm py-10 text-center">No properties in this category.</p>
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
                <th className="px-4 py-3 text-left font-medium">Posted</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-slate-900 max-w-[180px] truncate">{p.title}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize text-xs">{p.property_type}<br/>{p.listing_type}</td>
                  <td className="px-4 py-3 text-gray-700 text-xs">
                    {p.listing_type === 'rent'
                      ? `R${(p.rent_price ?? 0).toLocaleString()}/mo`
                      : `R${p.price.toLocaleString()}`}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{p.city ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[p.moderation_status] ?? STATUS_BADGE[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {p.moderation_status === 'approved' ? p.status : p.moderation_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.moderation_status === 'pending' && (
                        <>
                          <button disabled={loadingId === p.id}
                            onClick={() => action(p.id, { moderation_status: 'approved', status: 'available', approved_at: new Date().toISOString() })}
                            className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50">
                            ✅ Approve
                          </button>
                          <button disabled={loadingId === p.id}
                            onClick={() => action(p.id, { moderation_status: 'rejected' })}
                            className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50">
                            ❌ Reject
                          </button>
                        </>
                      )}
                      {p.moderation_status === 'approved' && p.status === 'available' && (
                        <>
                          <button disabled={loadingId === p.id}
                            onClick={() => action(p.id, { status: 'sold' })}
                            className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50">
                            🏷️ Sold
                          </button>
                          <button disabled={loadingId === p.id}
                            onClick={() => action(p.id, { status: 'rented' })}
                            className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-50">
                            🔑 Rented
                          </button>
                        </>
                      )}
                      <button disabled={loadingId === p.id}
                        onClick={() => handleDelete(p.id)}
                        className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50">
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
