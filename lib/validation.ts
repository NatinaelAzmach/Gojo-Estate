import { PropertyFormInput } from '@/lib/types';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 10_485_760; // 10 MB

export function validateListingForm(
  input: Partial<PropertyFormInput>
): Record<string, string> {
  const errors: Record<string, string> = {};

  const isBlank = (v: unknown) =>
    v === undefined || v === null || v === '' || (typeof v === 'number' && (v === 0 || isNaN(v)));

  if (isBlank(input.title)) errors.title = 'Title is required';
  if (isBlank(input.price)) errors.price = 'Price is required';
  if (isBlank(input.address)) errors.address = 'Address is required';
  if (isBlank(input.bedrooms)) errors.bedrooms = 'Bedrooms is required';
  if (isBlank(input.bathrooms)) errors.bathrooms = 'Bathrooms is required';
  if (isBlank(input.sqft)) errors.sqft = 'Sqft is required';

  return errors;
}

export function validateImageFile(file: {
  type: string;
  size: number;
}): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed.' };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'File size must not exceed 10 MB.' };
  }
  return { valid: true };
}
