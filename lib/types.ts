export type UserRole = 'user' | 'agent' | 'admin';
export type ListingStatus = 'available' | 'pending' | 'sold' | 'rented' | 'archived';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';
export type ListingType = 'sale' | 'rent';
export type PropertyType = 'house' | 'apartment' | 'condo' | 'land' | 'commercial';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface Property {
  id: string;
  agent_id: string;       // owner's user id
  title: string;
  description: string | null;
  price: number;
  rent_price: number | null;
  address: string;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  images: string[];
  featured_image: string | null;
  listing_type: ListingType;
  property_type: PropertyType;
  status: ListingStatus;
  moderation_status: ModerationStatus;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
}

export interface PropertyFormInput {
  title: string;
  description?: string;
  listing_type: ListingType;
  property_type: PropertyType;
  price: number;
  rent_price?: number;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  imageFiles?: File[];
}

export interface ListingFilters {
  location?: string;
  city?: string;
  propertyType?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  page: number;
  pageSize: number;
}

export type ActionResult =
  | { success: true; data?: unknown }
  | { success: false; error: string };
