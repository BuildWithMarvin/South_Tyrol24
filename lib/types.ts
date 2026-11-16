
export type Locale = "de" | "it" | "en" | "zh";

export interface LocalizedContent {
  title: string;
  region: string;
  description: string;
}

export interface CalendarLocation {
  name: string;
  lat: number;
  lng: number;
  mapsUrl: string;
}

export interface ImageCredit {
  author: string;
  source: string;
  sourceUrl?: string;
  license?: string;
  licenseUrl?: string;
}

export interface DayData {
  day: number;
  slug: string;
  imageUrl: string;
  /** Attribution for the photo. Withheld until the door unlocks. */
  imageCredit?: ImageCredit;
  location: CalendarLocation;
  content: Record<Locale, LocalizedContent>;
}

/** A door that has not been unlocked yet: no spoilers leave the server. */
export interface LockedDay {
  day: number;
  isLocked: true;
}

export type UnlockedDay = DayData & { isLocked: false };

export type PublicDay = UnlockedDay | LockedDay;
