'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/browser';
import { Property } from '@/lib/types';

interface Props {
  initialListing: Property;
  statusStyles: Record<Property['status'], string>;
}

export default function ListingRealtimeUpdater({ initialListing, statusStyles }: Props) {
  const [listing, setListing] = useState<Property>(initialListing);

  useEffect(() => {
    const client = createBrowserClient();
    const channel = client
      .channel(`listing-${listing.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'properties',
          filter: `id=eq.${listing.id}`,
        },
        (payload) => {
          const updated = payload.new as Property;
          setListing((prev) => ({
            ...prev,
            price: updated.price,
            status: updated.status,
          }));
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [listing.id]);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-brand">{listing.title}</h1>
          <p className="text-gray-500 mt-1">{listing.address}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-teal-brand">
            ${listing.price.toLocaleString('en-US')}
          </p>
          <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${statusStyles[listing.status]}`}>
            {listing.status}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-6 py-5 border-y border-gray-100 mb-6 text-gray-700">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="font-medium">{listing.bedrooms}</span>
          <span className="text-sm text-gray-500">Bedrooms</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">{listing.bathrooms}</span>
          <span className="text-sm text-gray-500">Bathrooms</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <span className="font-medium">{listing.sqft.toLocaleString()}</span>
          <span className="text-sm text-gray-500">sqft</span>
        </div>
      </div>

      {/* Description */}
      {listing.description && (
        <div>
          <h2 className="text-navy-brand font-semibold text-lg mb-2">About this property</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
        </div>
      )}
    </div>
  );
}
