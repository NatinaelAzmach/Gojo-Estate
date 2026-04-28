import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { Property } from '@/lib/types';
import ListingForm from '@/components/ListingForm';

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: listing, error } = await supabase
    .from('properties').select('*').eq('id', id).single();

  if (error || !listing) notFound();

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Edit Listing</h1>
        <ListingForm initialData={listing as Property} />
      </div>
    </main>
  );
}
