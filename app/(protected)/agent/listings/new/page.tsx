import ListingForm from '@/components/ListingForm';

export default function NewListingPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Create New Listing</h1>
        <ListingForm />
      </div>
    </main>
  );
}
