'use client';

import { useState } from 'react';
import { updateProfile } from '@/actions/profile';
import { Profile } from '@/lib/types';

interface ProfileFormProps {
  initialProfile: Profile;
}

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialProfile.full_name ?? '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    const formData = new FormData();
    formData.set('full_name', fullName);

    const result = await updateProfile(formData);
    setLoading(false);
    if (result.success) setSuccess(true);
    else setError(result.error);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="rounded-md bg-teal-50 border border-teal-200 p-4 text-teal-800 text-sm">
          Profile updated successfully.
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input id="full_name" type="text" value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="Your full name" />
      </div>

      <button type="submit" disabled={loading}
        className="w-full rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
        {loading ? 'Saving…' : 'Save Profile'}
      </button>
    </form>
  );
}
