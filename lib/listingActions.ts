import { Property, PropertyFormInput } from '@/lib/types';

export function buildInsertPayload(
  input: PropertyFormInput,
  uid: string
): Omit<Property, 'id' | 'created_at' | 'updated_at' | 'approved_at'> {
  return {
    agent_id: uid,
    title: input.title,
    description: input.description ?? null,
    price: input.price,
    rent_price: input.rent_price ?? null,
    address: input.address,
    city: input.city ?? null,
    state: null,
    zip_code: null,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    sqft: input.sqft,
    images: [],
    featured_image: null,
    listing_type: input.listing_type ?? 'sale',
    property_type: input.property_type ?? 'house',
    status: 'available',
    moderation_status: 'pending',
  };
}

export function buildListingWithImages(
  input: PropertyFormInput,
  imageUrls: string[]
): PropertyFormInput & { images: string[] } {
  return { ...input, images: imageUrls };
}
