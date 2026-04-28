'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';
import { createBrowserClient } from '@/lib/supabase/browser';
import type { ListingType, PropertyType } from '@/lib/types';

const PROPERTY_TYPES: PropertyType[] = ['house', 'apartment', 'condo', 'land', 'commercial'];
const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
];

export default function PostPropertyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [form, setForm] = useState({
    title: '', description: '', listing_type: 'sale' as ListingType,
    property_type: 'house' as PropertyType, price: '', rent_price: '',
    address: '', city: '',
    bedrooms: '', bathrooms: '', sqft: '',
  });

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title || !form.address || !form.city) {
      setError('Title, address, and city are required.');
      return;
    }
    if (form.listing_type === 'sale' && !form.price) {
      setError('Price is required for sale listings.');
      return;
    }
    if (form.listing_type === 'rent' && !form.rent_price) {
      setError('Rent price is required for rental listings.');
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not authenticated.'); setLoading(false); return; }

    // Upload images
    const imageUrls: string[] = [];
    for (const file of imageFiles) {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage.from('properties').upload(path, file);
      if (uploadErr) { setError(`Image upload failed: ${uploadErr.message}`); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from('properties').getPublicUrl(path);
      imageUrls.push(urlData.publicUrl);
    }

    const payload = {
      agent_id: user.id,
      title: form.title,
      description: form.description || null,
      listing_type: form.listing_type,
      property_type: form.property_type,
      price: form.listing_type === 'sale' ? Number(form.price) : 0,
      rent_price: form.listing_type === 'rent' ? Number(form.rent_price) : null,
      address: form.address,
      city: form.city,
      state: null,
      zip_code: null,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      sqft: Number(form.sqft) || 0,
      images: imageUrls,
      featured_image: imageUrls[0] ?? null,
      status: 'pending',
      moderation_status: 'pending',
    };

    const { error: insertErr } = await supabase.from('properties').insert(payload);
    setLoading(false);

    if (insertErr) { setError(insertErr.message); return; }
    router.push('/my-properties?posted=1');
  }

  const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
      {error && <div className="rounded-lg bg-red-50 border border-red-300 p-3 text-red-700 text-sm">{error}</div>}

      {/* Listing type */}
      <div className="flex gap-3">
        {LISTING_TYPES.map(({ value, label }) => (
          <button key={value} type="button"
            onClick={() => set('listing_type', value)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              form.listing_type === value
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div>
        <label className={labelCls}>Title *</label>
        <input type="text" required value={form.title} onChange={e => set('title', e.target.value)}
          className={inputCls} placeholder="e.g. Modern 3-Bedroom House in Sandton" />
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
          className={inputCls} placeholder="Describe the property..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Property Type *</label>
          <select value={form.property_type} onChange={e => set('property_type', e.target.value)} className={inputCls}>
            {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>{form.listing_type === 'rent' ? 'Monthly Rent (R) *' : 'Price (R) *'}</label>
          <input type="number" min={0}
            value={form.listing_type === 'rent' ? form.rent_price : form.price}
            onChange={e => set(form.listing_type === 'rent' ? 'rent_price' : 'price', e.target.value)}
            className={inputCls} placeholder="0" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Address *</label>
          <input type="text" required value={form.address} onChange={e => set('address', e.target.value)}
            className={inputCls} placeholder="123 Bole Road" />
        </div>
        <div>
          <label className={labelCls}>City *</label>
          <input type="text" required value={form.city} onChange={e => set('city', e.target.value)}
            className={inputCls} placeholder="Addis Ababa" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Bedrooms</label>
          <input type="number" min={0} value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}
            className={inputCls} placeholder="3" />
        </div>
        <div>
          <label className={labelCls}>Bathrooms</label>
          <input type="number" min={0} step="0.5" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}
            className={inputCls} placeholder="2" />
        </div>
        <div>
          <label className={labelCls}>Sqft / m²</label>
          <input type="number" min={0} value={form.sqft} onChange={e => set('sqft', e.target.value)}
            className={inputCls} placeholder="120" />
        </div>
      </div>

      <ImageUploader onFilesChange={setImageFiles} label="Property Images" />

      <button type="submit" disabled={loading}
        className="w-full bg-teal-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
        {loading ? 'Submitting…' : 'Submit for Approval'}
      </button>
    </form>
  );
}
