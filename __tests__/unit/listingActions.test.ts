import { describe, it, expect } from 'vitest';
import { buildInsertPayload, buildListingWithImages } from '@/lib/listingActions';
import { PropertyFormInput } from '@/lib/types';

const baseInput: PropertyFormInput = {
  title: 'Cozy Cottage',
  description: 'A lovely place',
  price: 250000,
  address: '123 Main St',
  bedrooms: 3,
  bathrooms: 2,
  sqft: 1500,
};

describe('buildInsertPayload', () => {
  it('maps all fields from input', () => {
    const result = buildInsertPayload(baseInput, 'uid-123');
    expect(result.title).toBe(baseInput.title);
    expect(result.description).toBe(baseInput.description);
    expect(result.price).toBe(baseInput.price);
    expect(result.address).toBe(baseInput.address);
    expect(result.bedrooms).toBe(baseInput.bedrooms);
    expect(result.bathrooms).toBe(baseInput.bathrooms);
    expect(result.sqft).toBe(baseInput.sqft);
  });

  it('always sets agent_id to the provided uid', () => {
    const result = buildInsertPayload(baseInput, 'uid-abc');
    expect(result.agent_id).toBe('uid-abc');
  });

  it('always sets moderation_status to pending', () => {
    const result = buildInsertPayload(baseInput, 'uid-123');
    expect(result.moderation_status).toBe('pending');
  });

  it('always sets status to available', () => {
    const result = buildInsertPayload(baseInput, 'uid-123');
    expect(result.status).toBe('available');
  });

  it('always sets images to empty array', () => {
    const result = buildInsertPayload(baseInput, 'uid-123');
    expect(result.images).toEqual([]);
  });

  it('sets description to null when not provided', () => {
    const { description, ...inputWithoutDesc } = baseInput;
    const result = buildInsertPayload(inputWithoutDesc, 'uid-123');
    expect(result.description).toBeNull();
  });
});

describe('buildListingWithImages', () => {
  it('merges imageUrls into the images field', () => {
    const urls = ['https://cdn.example.com/a.jpg', 'https://cdn.example.com/b.jpg'];
    const result = buildListingWithImages(baseInput, urls);
    expect(result.images).toEqual(urls);
  });

  it('preserves all original input fields', () => {
    const result = buildListingWithImages(baseInput, []);
    expect(result.title).toBe(baseInput.title);
    expect(result.price).toBe(baseInput.price);
    expect(result.address).toBe(baseInput.address);
  });

  it('returns empty images array when no urls provided', () => {
    const result = buildListingWithImages(baseInput, []);
    expect(result.images).toEqual([]);
  });

  it('does not drop any provided imageUrls', () => {
    const urls = ['url1', 'url2', 'url3'];
    const result = buildListingWithImages(baseInput, urls);
    expect(result.images).toHaveLength(3);
    urls.forEach(url => expect(result.images).toContain(url));
  });
});
