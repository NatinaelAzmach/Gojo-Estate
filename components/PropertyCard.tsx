import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/lib/types';

interface PropertyCardProps {
  property: Property;
}

const STATUS_BADGE: Record<string, string> = {
  available: 'bg-green-100 text-green-800',
  pending:   'bg-yellow-100 text-yellow-800',
  sold:      'bg-red-100 text-red-800',
  rented:    'bg-purple-100 text-purple-800',
  archived:  'bg-gray-100 text-gray-600',
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const { id, title, address, city, price, rent_price, listing_type, property_type, bedrooms, bathrooms, sqft, images, featured_image, status } = property;
  const imageUrl = featured_image ?? images?.[0] ?? null;

  const isRent = listing_type === 'rent';
  const displayPrice = isRent
    ? `ETB ${(rent_price ?? 0).toLocaleString()}/mo`
    : `ETB ${price.toLocaleString()}`;

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow border border-gray-100 flex flex-col">
      <div className="relative h-48 bg-gray-200">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 33vw" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
        )}
        {listing_type && (
          <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
            isRent ? 'bg-purple-600 text-white' : 'bg-teal-600 text-white'
          }`}>
            {isRent ? 'For Rent' : 'For Sale'}
          </span>
        )}
        {status !== 'available' && (
          <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[status]}`}>
            {status}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-teal-600 font-bold text-lg">{displayPrice}</p>
        <h3 className="text-slate-900 font-semibold text-sm mt-1 line-clamp-1">{title}</h3>
        <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{city ? `${city} · ` : ''}{address}</p>
        {property_type && <p className="text-gray-400 text-xs mt-0.5 capitalize">{property_type}</p>}

        <div className="flex items-center gap-4 mt-3 text-gray-600 text-xs">
          {bedrooms > 0 && <span>🛏 {bedrooms} bd</span>}
          {bathrooms > 0 && <span>🚿 {bathrooms} ba</span>}
          {sqft > 0 && <span>📐 {sqft.toLocaleString()} m²</span>}
        </div>

        <div className="mt-auto pt-4">
          <Link href={`/listings/${id}`}
            className="block text-center bg-slate-900 hover:bg-teal-600 text-white text-sm font-medium py-2 rounded-lg transition-colors">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
