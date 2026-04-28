'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { buildListingsUrl } from '@/lib/queryBuilder';
import { ListingFilters } from '@/lib/types';

export default function HeroSearch() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [listingType, setListingType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const filters: Partial<ListingFilters> = {};
    if (location) filters.location = location;
    if (propertyType) filters.propertyType = propertyType;
    if (listingType) filters.listingType = listingType;
    if (minPrice) filters.minPrice = Number(minPrice);
    if (maxPrice) filters.maxPrice = Number(maxPrice);
    router.push(buildListingsUrl(filters));
  }

  return (
    <form onSubmit={handleSubmit}
      className="bg-navy-brand/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-300 uppercase tracking-wider">Location</label>
          <input type="text" placeholder="City, address…" value={location} onChange={e => setLocation(e.target.value)}
            className="bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-300 uppercase tracking-wider">Type</label>
          <select value={propertyType} onChange={e => setPropertyType(e.target.value)}
            className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="" className="text-gray-900">All Types</option>
            {['house','apartment','condo','land','commercial'].map(t => (
              <option key={t} value={t} className="text-gray-900 capitalize">{t.charAt(0).toUpperCase()+t.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-300 uppercase tracking-wider">For</label>
          <select value={listingType} onChange={e => setListingType(e.target.value)}
            className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="" className="text-gray-900">Buy or Rent</option>
            <option value="sale" className="text-gray-900">For Sale</option>
            <option value="rent" className="text-gray-900">For Rent</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-300 uppercase tracking-wider">Max Price</label>
          <input type="number" placeholder="No limit" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} min={0}
            className="bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <button type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-2.5 rounded-lg transition-colors text-sm">
          Search Properties
        </button>
      </div>
    </form>
  );
}
