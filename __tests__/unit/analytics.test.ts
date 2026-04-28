import { describe, it, expect } from 'vitest';
import { computeAnalytics } from '@/lib/analytics';
import type { Property, Profile } from '@/lib/types';

const baseProperty = (overrides: Partial<Property>): Property => ({
  id: '1',
  agent_id: 'a1',
  title: 'Test',
  description: null,
  price: 100000,
  address: '1 Main St',
  bedrooms: 2,
  bathrooms: 1,
  sqft: 800,
  images: [],
  status: 'available',
  moderation_status: 'approved',
  created_at: '2024-01-01',
  ...overrides,
});

const baseProfile = (id: string): Profile => ({
  id,
  full_name: 'User',
  avatar_url: null,
  role: 'user',
  created_at: '2024-01-01',
});

describe('computeAnalytics', () => {
  it('returns zeros when given empty arrays', () => {
    expect(computeAnalytics([], [])).toEqual({
      totalRevenue: 0,
      activeListings: 0,
      totalUsers: 0,
    });
  });

  it('sums price only for sold properties', () => {
    const properties = [
      baseProperty({ id: '1', status: 'sold', price: 200000 }),
      baseProperty({ id: '2', status: 'sold', price: 350000 }),
      baseProperty({ id: '3', status: 'available', price: 500000 }),
    ];
    const { totalRevenue } = computeAnalytics(properties, []);
    expect(totalRevenue).toBe(550000);
  });

  it('counts only available properties as activeListings', () => {
    const properties = [
      baseProperty({ id: '1', status: 'available' }),
      baseProperty({ id: '2', status: 'available' }),
      baseProperty({ id: '3', status: 'pending' }),
      baseProperty({ id: '4', status: 'sold' }),
    ];
    const { activeListings } = computeAnalytics(properties, []);
    expect(activeListings).toBe(2);
  });

  it('counts all profiles as totalUsers', () => {
    const profiles = [baseProfile('u1'), baseProfile('u2'), baseProfile('u3')];
    const { totalUsers } = computeAnalytics([], profiles);
    expect(totalUsers).toBe(3);
  });

  it('returns totalRevenue of 0 when no sold properties', () => {
    const properties = [
      baseProperty({ id: '1', status: 'available' }),
      baseProperty({ id: '2', status: 'pending' }),
    ];
    const { totalRevenue } = computeAnalytics(properties, []);
    expect(totalRevenue).toBe(0);
  });

  it('returns activeListings of 0 when no available properties', () => {
    const properties = [
      baseProperty({ id: '1', status: 'sold' }),
      baseProperty({ id: '2', status: 'archived' }),
    ];
    const { activeListings } = computeAnalytics(properties, []);
    expect(activeListings).toBe(0);
  });

  it('computes all three values together correctly', () => {
    const properties = [
      baseProperty({ id: '1', status: 'sold', price: 100000 }),
      baseProperty({ id: '2', status: 'available', price: 200000 }),
      baseProperty({ id: '3', status: 'available', price: 300000 }),
    ];
    const profiles = [baseProfile('u1'), baseProfile('u2')];
    expect(computeAnalytics(properties, profiles)).toEqual({
      totalRevenue: 100000,
      activeListings: 2,
      totalUsers: 2,
    });
  });
});
