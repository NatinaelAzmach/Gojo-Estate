import { SupabaseClient } from '@supabase/supabase-js';
import { ListingFilters } from '@/lib/types';

export function buildPublicListingsQuery(client: SupabaseClient, filters: ListingFilters) {
  return buildQuery(client, filters, true);
}

export function buildListingsQuery(client: SupabaseClient, filters: ListingFilters) {
  return buildQuery(client, filters, false);
}

function buildQuery(client: SupabaseClient, filters: ListingFilters, publicOnly: boolean) {
  let q = client.from('properties').select('*');
  if (publicOnly) q = q.eq('moderation_status', 'approved') as typeof q;
  if (filters.location) q = q.or(`address.ilike.%${filters.location}%,title.ilike.%${filters.location}%`) as typeof q;
  if (filters.propertyType) q = q.eq('property_type', filters.propertyType) as typeof q;
  if (filters.listingType) q = q.eq('listing_type', filters.listingType) as typeof q;
  if (filters.minPrice !== undefined) q = q.gte('price', filters.minPrice) as typeof q;
  if (filters.maxPrice !== undefined) q = q.lte('price', filters.maxPrice) as typeof q;
  if (filters.minBedrooms !== undefined) q = q.gte('bedrooms', filters.minBedrooms) as typeof q;
  const from = (filters.page - 1) * filters.pageSize;
  q = q.range(from, from + filters.pageSize - 1) as typeof q;
  return q;
}

export function buildRecentlyAddedQuery(client: SupabaseClient, limit: number) {
  return client
    .from('properties')
    .select('*')
    .eq('moderation_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);
}

export function buildListingsUrl(filters: Partial<ListingFilters>): string {
  const params = new URLSearchParams();
  if (filters.location) params.set('location', filters.location);
  if (filters.propertyType) params.set('propertyType', filters.propertyType);
  if (filters.listingType) params.set('listingType', filters.listingType);
  if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
  if (filters.minBedrooms !== undefined) params.set('minBedrooms', String(filters.minBedrooms));
  if (filters.page !== undefined) params.set('page', String(filters.page));
  if (filters.pageSize !== undefined) params.set('pageSize', String(filters.pageSize));
  const qs = params.toString();
  return qs ? `/listings?${qs}` : '/listings';
}
