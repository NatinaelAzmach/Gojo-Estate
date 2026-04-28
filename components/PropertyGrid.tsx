'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/browser';
import { buildPublicListingsQuery } from '@/lib/queryBuilder';
import { applyRealtimeUpdate, applyRealtimeInsert, applyRealtimeDelete } from '@/lib/realtimeHandlers';
import PropertyCard from '@/components/PropertyCard';
import { Property, ListingFilters } from '@/lib/types';

interface PropertyGridProps {
  initialListings: Property[];
  filters: Partial<ListingFilters>;
}

const POLL_INTERVAL_MS = 30_000;

export default function PropertyGrid({ initialListings, filters }: PropertyGridProps) {
  const [listings, setListings] = useState<Property[]>(initialListings);
  const [page, setPage] = useState(filters.page ?? 1);

  const fetchListings = useCallback(async () => {
    const client = createBrowserClient();
    const { data } = await buildPublicListingsQuery(client, {
      page,
      pageSize: filters.pageSize ?? 9,
      location: filters.location,
      propertyType: filters.propertyType,
      listingType: filters.listingType,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
    });
    if (data) setListings(data as Property[]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.location, filters.propertyType, filters.listingType, filters.minPrice, filters.maxPrice, filters.pageSize]);

  useEffect(() => {
    const client = createBrowserClient();
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const channel = client
      .channel('listings-public')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'properties' },
        (payload) => {
          setListings((prev) => applyRealtimeUpdate(prev, payload as unknown as { new: Property }));
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'properties' },
        (payload) => {
          setListings((prev) => applyRealtimeInsert(prev, payload as unknown as { new: Property }));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'properties' },
        (payload) => {
          setListings((prev) => applyRealtimeDelete(prev, payload as unknown as { old: { id: string } }));
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          // Fall back to polling
          pollTimer = setInterval(fetchListings, POLL_INTERVAL_MS);
        }
      });

    return () => {
      client.removeChannel(channel);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [fetchListings]);

  // Re-fetch when page or filters change
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const hasPrev = page > 1;
  const hasNext = listings.length >= (filters.pageSize ?? 9);

  return (
    <div>
      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-medium">No listings found</p>
          <p className="text-sm mt-1">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {(hasPrev || hasNext) && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!hasPrev}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
