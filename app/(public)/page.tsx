import { createServerClient } from '@/lib/supabase/server';
import { Property } from '@/lib/types';
import HeroSearch from '@/components/HeroSearch';
import PropertyCard from '@/components/PropertyCard';

export default async function HomePage() {
  let listings: Property[] = [];

  try {
    const client = await createServerClient();
    const { data } = await client
      .from('properties')
      .select('*')
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(6);
    listings = (data ?? []) as Property[];
  } catch {
    // render empty on error
  }

  return (
    <div>
      <section className="relative bg-slate-900 py-24 px-4">
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Find Your <span className="text-teal-400">Perfect Home</span> in Ethiopia
          </h1>
          <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
            Browse verified listings across Addis Ababa and all of Ethiopia. Buy, sell, or rent with GOJO.
          </p>
          <HeroSearch />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Featured Listings</h2>
          <a href="/listings" className="text-teal-600 hover:underline text-sm font-medium">View all →</a>
        </div>
        {listings.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No listings available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
