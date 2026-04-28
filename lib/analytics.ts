import { Property, Profile } from '@/lib/types';

export function computeAnalytics(
  properties: Property[],
  profiles: Profile[]
): { totalRevenue: number; activeListings: number; totalUsers: number } {
  const totalRevenue = properties
    .filter((p) => p.status === 'sold')
    .reduce((sum, p) => sum + p.price, 0);

  const activeListings = properties.filter((p) => p.status === 'available').length;

  const totalUsers = profiles.length;

  return { totalRevenue, activeListings, totalUsers };
}
