'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Profile, UserRole } from '@/lib/types';
import { updateUserRole, banUser, deleteUser } from '@/actions/admin';

const ROLES: UserRole[] = ['user', 'agent', 'admin'];
const PAGE_SIZE = 10;

export default function UserGrid({ initialProfiles }: { initialProfiles: Profile[] }) {
  const router = useRouter();
  const [profiles, setProfiles] = useState(initialProfiles);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = profiles.filter((p) =>
    (p.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleRoleChange(userId: string, role: UserRole) {
    setLoadingId(userId);
    await updateUserRole(userId, role);
    setLoadingId(null);
    router.refresh();
  }

  async function handleBan(userId: string) {
    setLoadingId(userId);
    await banUser(userId);
    setLoadingId(null);
    router.refresh();
  }

  async function handleDelete(userId: string) {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    setLoadingId(userId);
    await deleteUser(userId);
    setProfiles((prev) => prev.filter((p) => p.id !== userId));
    setLoadingId(null);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-[#0f1f3d] text-white">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Joined</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  No users found.
                </td>
              </tr>
            ) : (
              paginated.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {profile.full_name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={profile.role}
                      disabled={loadingId === profile.id}
                      onChange={(e) => handleRoleChange(profile.id, e.target.value as UserRole)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleBan(profile.id)}
                      disabled={loadingId === profile.id}
                      className="px-3 py-1 text-xs rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 disabled:opacity-50"
                    >
                      Ban
                    </button>
                    <button
                      onClick={() => handleDelete(profile.id)}
                      disabled={loadingId === profile.id}
                      className="px-3 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                    >
                      Delete
                    </button>
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
