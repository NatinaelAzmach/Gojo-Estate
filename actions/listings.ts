'use server';

import { ActionResult, PropertyFormInput } from '@/lib/types';
import { validateListingForm } from '@/lib/validation';
import { buildInsertPayload, buildListingWithImages } from '@/lib/listingActions';
import { createServerClient } from '@/lib/supabase/server';

export async function createListing(formData: FormData): Promise<ActionResult> {
  try {
    const input: Partial<PropertyFormInput> = {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || undefined,
      price: Number(formData.get('price')),
      address: formData.get('address') as string,
      bedrooms: Number(formData.get('bedrooms')),
      bathrooms: Number(formData.get('bathrooms')),
      sqft: Number(formData.get('sqft')),
    };

    const errors = validateListingForm(input);
    if (Object.keys(errors).length > 0) {
      return { success: false, error: 'Validation failed' };
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const imageFiles = formData.getAll('images') as File[];
    const uploadedPaths: string[] = [];
    const imageUrls: string[] = [];

    for (const file of imageFiles) {
      if (!file || file.size === 0) continue;

      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('properties')
        .upload(path, file);

      if (uploadError) {
        // Clean up already-uploaded images
        if (uploadedPaths.length > 0) {
          await supabase.storage.from('properties').remove(uploadedPaths);
        }
        return { success: false, error: `Image upload failed: ${uploadError.message}` };
      }

      uploadedPaths.push(path);

      const { data: urlData } = supabase.storage
        .from('properties')
        .getPublicUrl(path);
      imageUrls.push(urlData.publicUrl);
    }

    const payload = buildInsertPayload(input as PropertyFormInput, user.id);
    const listingWithImages = buildListingWithImages(input as PropertyFormInput, imageUrls);
    const insertData = { ...payload, images: listingWithImages.images };

    const { error: insertError } = await supabase
      .from('properties')
      .insert(insertData);

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

export async function updateListing(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const input: Partial<PropertyFormInput> = {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || undefined,
      price: Number(formData.get('price')),
      address: formData.get('address') as string,
      bedrooms: Number(formData.get('bedrooms')),
      bathrooms: Number(formData.get('bathrooms')),
      sqft: Number(formData.get('sqft')),
    };

    const errors = validateListingForm(input);
    if (Object.keys(errors).length > 0) {
      return { success: false, error: 'Validation failed' };
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error: updateError } = await supabase
      .from('properties')
      .update({
        title: input.title,
        description: input.description ?? null,
        price: input.price,
        address: input.address,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        sqft: input.sqft,
      })
      .eq('id', id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

export async function archiveListing(id: string): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('properties')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

export async function deleteListing(id: string): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: listing, error: fetchError } = await supabase
      .from('properties')
      .select('images')
      .eq('id', id)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    if (listing?.images && listing.images.length > 0) {
      const paths = listing.images.map((url: string) => {
        const parts = url.split('/properties/');
        return parts[parts.length - 1];
      });
      await supabase.storage.from('properties').remove(paths);
    }

    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
