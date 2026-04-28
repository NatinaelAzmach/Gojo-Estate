'use client';

import { useRouter } from 'next/navigation';
import { deleteListing } from '@/actions/listings';

interface DeleteListingButtonProps {
  listingId: string;
}

export default function DeleteListingButton({ listingId }: DeleteListingButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm('Are you sure you want to delete this listing?');
    if (!confirmed) return;

    const result = await deleteListing(listingId);
    if (!result.success) {
      alert(`Failed to delete listing: ${result.error}`);
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
    >
      Delete
    </button>
  );
}
