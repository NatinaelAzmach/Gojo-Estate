import Link from 'next/link';
import Image from 'next/image';
import { createServerClient } from '@/lib/supabase/server';
import { buildRecentlyAddedQuery } from '@/lib/queryBuilder';
import { Property } from '@/lib/types';

export default async function RecentSidebar() {
  const client = await createServerClient();
  const { data } = await buildRecentlyAddedQuery(client, 5);
  const listings = (data ?? []) as Property[];

  return (
    <aside className="bg-white rounded-xl border border-gray-100 shadow p-5">
      <h2 className="text-navy-brand font-bold text-base mb-4 border-b border-gray-100 pb-3">
        Recently Added
      </h2>

      {listings.length === 0 ? (
        <p className="text-gray-400 text-sm">No recent listings.</p>
      ) : (
        <ul className="space-y-4">
          {listings.map((listing) => (
            <li key={listing.id}>
              <Link
                href={`/listings/${listing.id}`}
                className="flex items-center gap-3 group"
              >
                {/* Thumbnail */}
                <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {listing.images?.[0] ? (
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy-brand group-hover:text-teal-brand transition-colors line-clamp-1">
                    {listing.title}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{listing.address}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
