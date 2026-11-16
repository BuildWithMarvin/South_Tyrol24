import type { DayData, LockedDay, PublicDay } from "@/lib/types";

/**
 * Converts a stored door into its public representation.
 *
 * Unlocked doors expose their full data. Locked doors are reduced to the
 * `LockedDay` shape, which deliberately has no fields for `content`,
 * `location`, `imageUrl` or `imageCredit` — no metadata may leak before the
 * matching December date.
 */
export function toPublicDay(day: DayData, unlockedThrough: number): PublicDay {
  if (day.day <= unlockedThrough) {
    return { ...day, isLocked: false };
  }

  const locked: LockedDay = { day: day.day, isLocked: true };
  return locked;
}
