import { describe, it, expect } from 'vitest';
import {
  applyRealtimeUpdate,
  applyRealtimeInsert,
  applyRealtimeDelete,
} from '@/lib/realtimeHandlers';
import { Property } from '@/lib/types';

const makeProperty = (overrides: Partial<Property> = {}): Property => ({
  id: 'prop-1',
  agent_id: 'agent-1',
  title: 'Test Property',
  description: null,
  price: 100000,
  address: '1 Main St',
  bedrooms: 3,
  bathrooms: 2,
  sqft: 1200,
  images: [],
  status: 'available',
  moderation_status: 'approved',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('applyRealtimeUpdate', () => {
  it('replaces the matching listing', () => {
    const original = makeProperty({ id: 'a', title: 'Old' });
    const updated = makeProperty({ id: 'a', title: 'New' });
    const result = applyRealtimeUpdate([original], { new: updated });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('New');
  });

  it('leaves other listings unchanged', () => {
    const a = makeProperty({ id: 'a' });
    const b = makeProperty({ id: 'b', title: 'B' });
    const updatedA = makeProperty({ id: 'a', title: 'Updated A' });
    const result = applyRealtimeUpdate([a, b], { new: updatedA });
    expect(result[1]).toEqual(b);
  });

  it('returns array unchanged when id not found', () => {
    const a = makeProperty({ id: 'a' });
    const unknown = makeProperty({ id: 'z' });
    const result = applyRealtimeUpdate([a], { new: unknown });
    expect(result).toEqual([a]);
  });
});

describe('applyRealtimeInsert', () => {
  it('prepends approved listing', () => {
    const existing = makeProperty({ id: 'b' });
    const newProp = makeProperty({ id: 'a', moderation_status: 'approved' });
    const result = applyRealtimeInsert([existing], { new: newProp });
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(newProp);
  });

  it('does not insert pending listing', () => {
    const existing = makeProperty({ id: 'b' });
    const newProp = makeProperty({ id: 'a', moderation_status: 'pending' });
    const result = applyRealtimeInsert([existing], { new: newProp });
    expect(result).toEqual([existing]);
  });

  it('does not insert rejected listing', () => {
    const existing = makeProperty({ id: 'b' });
    const newProp = makeProperty({ id: 'a', moderation_status: 'rejected' });
    const result = applyRealtimeInsert([existing], { new: newProp });
    expect(result).toEqual([existing]);
  });

  it('result length is one greater when approved', () => {
    const listings = [makeProperty({ id: 'b' }), makeProperty({ id: 'c' })];
    const newProp = makeProperty({ id: 'a', moderation_status: 'approved' });
    const result = applyRealtimeInsert(listings, { new: newProp });
    expect(result).toHaveLength(listings.length + 1);
  });
});

describe('applyRealtimeDelete', () => {
  it('removes the matching listing', () => {
    const a = makeProperty({ id: 'a' });
    const b = makeProperty({ id: 'b' });
    const result = applyRealtimeDelete([a, b], { old: { id: 'a' } });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('b');
  });

  it('returns array unchanged when id not found', () => {
    const a = makeProperty({ id: 'a' });
    const result = applyRealtimeDelete([a], { old: { id: 'z' } });
    expect(result).toEqual([a]);
  });

  it('result does not contain the deleted id', () => {
    const listings = [makeProperty({ id: 'a' }), makeProperty({ id: 'b' })];
    const result = applyRealtimeDelete(listings, { old: { id: 'a' } });
    expect(result.find((l) => l.id === 'a')).toBeUndefined();
  });
});
