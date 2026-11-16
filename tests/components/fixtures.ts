import rawDays from "../../data/suedtirol.json";
import type { DayData, PublicDay, UnlockedDay } from "../../lib/types";

const all = rawDays as unknown as DayData[];

export function unlocked(day: number): UnlockedDay {
  const found = all.find((entry) => entry.day === day);
  if (!found) {
    throw new Error(`No dataset entry for day ${day}`);
  }
  return { ...found, isLocked: false };
}

/** All 24 doors; those above `through` are masked like the API does. */
export function makeDays(through: number): PublicDay[] {
  return Array.from({ length: 24 }, (_, i) =>
    i + 1 <= through ? unlocked(i + 1) : { day: i + 1, isLocked: true as const },
  );
}
