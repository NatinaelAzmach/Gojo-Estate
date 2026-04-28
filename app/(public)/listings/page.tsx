import { createServerClient } from '@/lib/supabase/server';
import { buildPublicListingsQuery } from '@/lib/queryBuilder';
import { ListingFilters, Property } from '@/lib/types';
import HeroSearch from '@/components/HeroSearch';
import PropertyGrid from '@/components/PropertyGrid';
import RecentSidebar from '@/components/RecentSidebar';

interface SearchParams {
  location?: string;
  propertyType?: string;
  listingType?: string;
  minPrice?: string;
  maxPrice?: string;
  minBedrooms?: string;
  page?: string;
  pageSize?: string;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const filters: ListingFilters = {
    location: params.location,
    propertyType: params.propertyType,
    listingType: params.listingType,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    minBedrooms: params.minBedrooms ? Number(params.minBedrooms) : undefined,
    page: params.page ? Number(params.page) : 1,
    pageSize: params.pageSize ? Number(params.pageSize) : 9,
  };

  const client = await createServerClient();
  const { data, error } = await buildPublicListingsQuery(client, filters);
  
  // If query fails (e.g. columns not yet migrated), fall back to empty list
  const listings = (error ? [] : (data ?? [])) as Property[];

  return (
    <div>
      <section className="bg-slate-900 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-white text-2xl font-bold mb-6 text-center">Browse Properties</h1>
          <HeroSearch />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="flex-1 min-w-0">
            <PropertyGrid initialListings={listings} filters={filters} />
          </main>
          <aside className="w-full lg:w-72 flex-shrink-0">
            <RecentSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}
