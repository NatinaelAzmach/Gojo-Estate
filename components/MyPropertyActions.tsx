'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/browser';
import type { Property } from '@/lib/types';

export default function MyPropertyActions({ property }: { property: Property }) {
  const router = useRouter();
  const isPending = property.moderation_status === 'pending';

  async function handleDelete() {
    if (!confirm('Delete this property? This cannot be undone.')) return;
    const supabase = createBrowserClient();
    await supabase.from('properties').delete().eq('id', property.id);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Link href={`/listings/${property.id}`}
        className="px-3 py-1 text-xs rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
        View
      </Link>
      {isPending && (
        <>
          <Link href={`/post-property/edit/${property.id}`}
            className="px-3 py-1 text-xs rounded bg-teal-100 text-teal-700 hover:bg-teal-200 transition">
            Edit
          </Link>
          <button onClick={handleDelete}
            className="px-3 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 transition">
            Delete
          </button>
        </>
      )}
    </div>
  );
}
