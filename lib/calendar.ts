
export const TOTAL_DAYS = 24;

const CALENDAR_TIME_ZONE = "Europe/Rome";

export interface CalendarDate {
  year: number;
  month: number;
  day: number;
  isoDate: string;
}

const datePartsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: CALENDAR_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function getCalendarDate(now: Date = new Date()): CalendarDate {
  const parts = datePartsFormatter.formatToParts(now);
  const values = new Map(parts.map((part) => [part.type, part.value]));

  const year = Number(values.get("year"));
  const month = Number(values.get("month"));
  const day = Number(values.get("day"));

  return { year, month, day, isoDate: `${year}-${pad(month)}-${pad(day)}` };
}

/**
 * Number of doors that may be shown in full.
 *
 * - 1–24 December: doors up to and including today's date.
 * - 25–31 December: all 24 doors (the season is over).
 * - Any other month: 0 doors, so the calendar cannot be spoiled early.
 *
 * The rule resets every year; `data/suedtirol.json` represents the current
 * season and is expected to be refreshed for the next one.
 */
export function getUnlockedThroughDay(now: Date = new Date()): number {
  const { month, day } = getCalendarDate(now);

  if (month === 12) {
    return Math.min(day, TOTAL_DAYS);
  }

  return 0;
}
