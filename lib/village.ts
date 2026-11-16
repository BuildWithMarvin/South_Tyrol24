/** Deliberately shuffled: people have to look for their door. */
export const HOUSES: ReadonlyArray<readonly [number, number, number]> = [
  [7, 19, 3],
  [14, 1, 22],
  [10, 24, 5],
  [17, 12, 8],
  [2, 21, 15],
  [9, 4, 18],
  [23, 13, 6],
  [20, 16, 11],
];

export const HOUSE_BODIES: readonly string[] = [
  "#2d2845",
  "#3a2a38",
  "#242d4a",
  "#3b2d30",
  "#2a3046",
  "#33283f",
  "#2e2a3a",
  "#392b36",
];

export const HOUSE_OFFSETS: readonly number[] = [0, 34, 10, 22, 4, 30, 14, 26];

export const ADVENT_DAYS: ReadonlySet<number> = new Set([6, 13, 20]);

/** Today's door = the highest unlocked day (0 when everything is locked). */
export function getTodayDoor(
  days: ReadonlyArray<{ day: number; isLocked: boolean }>,
): number {
  let today = 0;
  for (const entry of days) {
    if (!entry.isLocked && entry.day > today) {
      today = entry.day;
    }
  }
  return today;
}
