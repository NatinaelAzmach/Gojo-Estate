'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';
import { validateListingForm } from '@/lib/validation';
import { createListing, updateListing } from '@/actions/listings';
import { Property } from '@/lib/types';

interface ListingFormProps {
  initialData?: Property;
}

export default function ListingForm({ initialData }: ListingFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [price, setPrice] = useState(initialData?.price?.toString() ?? '');
  const [address, setAddress] = useState(initialData?.address ?? '');
  const [bedrooms, setBedrooms] = useState(initialData?.bedrooms?.toString() ?? '');
  const [bathrooms, setBathrooms] = useState(initialData?.bathrooms?.toString() ?? '');
  const [sqft, setSqft] = useState(initialData?.sqft?.toString() ?? '');
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const input = {
      title,
      description: description || undefined,
      price: Number(price),
      address,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      sqft: Number(sqft),
    };

    const errors = validateListingForm(input);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const formData = new FormData();
    formData.set('title', title);
    if (description) formData.set('description', description);
    formData.set('price', price);
    formData.set('address', address);
    formData.set('bedrooms', bedrooms);
    formData.set('bathrooms', bathrooms);
    formData.set('sqft', sqft);
    for (const file of imageFiles) {
      formData.append('images', file);
    }

    setLoading(true);
    try {
      const result = initialData
        ? await updateListing(initialData.id, formData)
        : await createListing(formData);

      if (!result.success) {
        setFormError(result.error);
        return;
      }

      router.push('/agent/listings');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {formError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {formError}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-navy-brand mb-1" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-brand"
        />
        {fieldErrors.title && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-navy-brand mb-1" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-brand"
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-navy-brand mb-1" htmlFor="price">
          Price ($)
        </label>
        <input
          id="price"
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-brand"
        />
        {fieldErrors.price && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.price}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-navy-brand mb-1" htmlFor="address">
          Address
        </label>
        <input
          id="address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-brand"
        />
        {fieldErrors.address && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.address}</p>
        )}
      </div>

      {/* Bedrooms / Bathrooms / Sqft */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy-brand mb-1" htmlFor="bedrooms">
            Bedrooms
          </label>
          <input
            id="bedrooms"
            type="number"
            min={0}
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-brand"
          />
          {fieldErrors.bedrooms && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.bedrooms}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-navy-brand mb-1" htmlFor="bathrooms">
            Bathrooms
          </label>
          <input
            id="bathrooms"
            type="number"
            min={0}
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-brand"
          />
          {fieldErrors.bathrooms && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.bathrooms}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-navy-brand mb-1" htmlFor="sqft">
            Sqft
          </label>
          <input
            id="sqft"
            type="number"
            min={0}
            value={sqft}
            onChange={(e) => setSqft(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-brand"
          />
          {fieldErrors.sqft && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.sqft}</p>
          )}
        </div>
      </div>

      {/* Images */}
      <ImageUploader onFilesChange={setImageFiles} />

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md bg-teal-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {loading ? 'Saving…' : initialData ? 'Update Listing' : 'Create Listing'}
      </button>
    </form>
  );
}
