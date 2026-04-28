import { Property } from '@/lib/types';

/**
 * Replaces the listing whose id matches event.new.id with event.new.
 * Returns the array unchanged if no match is found.
 */
export function applyRealtimeUpdate(
  listings: Property[],
  event: { new: Property }
): Property[] {
  const index = listings.findIndex((l) => l.id === event.new.id);
  if (index === -1) return listings;
  const updated = [...listings];
  updated[index] = event.new;
  return updated;
}

/**
 * Prepends event.new to the array only if moderation_status is 'approved'.
 * Returns the array unchanged otherwise.
 */
export function applyRealtimeInsert(
  listings: Property[],
  event: { new: Property }
): Property[] {
  if (event.new.moderation_status !== 'approved') return listings;
  return [event.new, ...listings];
}

/**
 * Filters out the listing whose id matches event.old.id.
 * Returns the array unchanged if no match is found.
 */
export function applyRealtimeDelete(
  listings: Property[],
  event: { old: { id: string } }
): Property[] {
  return listings.filter((l) => l.id !== event.old.id);
}
