import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { Property } from '@/lib/types';
import ListingRealtimeUpdater from './ListingRealtimeUpdater';

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_BADGE: Record<Property['status'], string> = {
  available: 'bg-green-100 text-green-800',
  pending:   'bg-yellow-100 text-yellow-800',
  sold:      'bg-red-100 text-red-800',
  rented:    'bg-purple-100 text-purple-800',
  archived:  'bg-gray-100 text-gray-600',
};

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const client = await createServerClient();

  const { data, error } = await client
    .from('properties')
    .select('*, profiles(full_name, avatar_url)')
    .eq('id', id)
    .single();

  if (error || !data) notFound();

  const listing = data as Property & { profiles: { full_name: string | null } | null };
  const displayPrice = listing.listing_type === 'rent'
    ? `R${(listing.rent_price ?? 0).toLocaleString()}/mo`
    : `R${listing.price.toLocaleString()}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/listings" className="text-teal-600 hover:underline text-sm mb-6 inline-block">← Back to listings</Link>

      {/* Image gallery */}
      {listing.images && listing.images.length > 0 ? (
        <div className="mb-8">
          <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-gray-100 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={listing.featured_image ?? listing.images[0]} alt={listing.title}
              className="w-full h-full object-cover" />
          </div>
          {listing.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {listing.images.slice(1).map((img, i) => (
                <div key={i} className="relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`${listing.title} ${i + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-64 rounded-xl bg-gray-100 flex items-center justify-center mb-8 text-gray-300">
          <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main details */}
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                  listing.listing_type === 'rent' ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800'
                }`}>
                  {listing.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
                <span className="text-xs text-gray-500 capitalize">{listing.property_type}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[listing.status]}`}>
                  {listing.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{listing.title}</h1>
              <p className="text-gray-500 mt-1">
                {[listing.address, listing.city, listing.state, listing.zip_code].filter(Boolean).join(', ')}
              </p>
            </div>
            <p className="text-3xl font-bold text-teal-600">{displayPrice}</p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 py-5 border-y border-gray-100 mb-6 text-gray-700">
            {listing.bedrooms > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-teal-600">🛏</span>
                <span className="font-medium">{listing.bedrooms}</span>
                <span className="text-sm text-gray-500">Bedrooms</span>
              </div>
            )}
            {listing.bathrooms > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-teal-600">🚿</span>
                <span className="font-medium">{listing.bathrooms}</span>
                <span className="text-sm text-gray-500">Bathrooms</span>
              </div>
            )}
            {listing.sqft > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-teal-600">📐</span>
                <span className="font-medium">{listing.sqft.toLocaleString()}</span>
                <span className="text-sm text-gray-500">m²</span>
              </div>
            )}
          </div>

          {listing.description && (
            <div>
              <h2 className="text-slate-900 font-semibold text-lg mb-2">About this property</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>
          )}

          {/* Realtime price/status updater */}
          <ListingRealtimeUpdater initialListing={listing} statusStyles={STATUS_BADGE} />
        </div>

        {/* Sidebar — contact */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-24">
            <h3 className="font-semibold text-slate-900 mb-4">Listed by</h3>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-semibold text-sm">
                {(listing.profiles?.full_name ?? 'A')[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-slate-900 text-sm">{listing.profiles?.full_name ?? 'Agent'}</p>
                <p className="text-xs text-gray-500">Property Owner</p>
              </div>
            </div>
            <a href="mailto:contact@gojo.co.za"
              className="block w-full text-center bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
              Contact Owner
            </a>
            <p className="text-xs text-gray-400 text-center mt-3">
              Posted {new Date(listing.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
