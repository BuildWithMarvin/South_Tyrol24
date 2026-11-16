import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import rawDays from "@/data/suedtirol.json";
import { getCalendarDate, getUnlockedThroughDay } from "@/lib/calendar";
import { toPublicDay } from "@/lib/masking";
import type { DayData, PublicDay } from "@/lib/types";

// The response depends on the current date, so it must never be prerendered.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const days: readonly DayData[] = rawDays satisfies DayData[];

/**
 * Constant-time comparison of the `?preview=` value with the server secret.
 * Hashing both inputs first guarantees equal-length buffers for
 * `timingSafeEqual` without leaking the secret's length.
 */
function isPreviewRequest(value: string | null, secret: string | undefined): boolean {
  if (!value || !secret) {
    return false;
  }

  const digest = (input: string) => createHash("sha256").update(input).digest();

  return timingSafeEqual(digest(value), digest(secret));
}

/**
 * GET /api/days
 *
 * Returns all 24 doors in calendar order. Doors after today's date are masked
 * to `{ day, isLocked: true }`.
 *
 * Preview bypass: `GET /api/days?preview=<PREVIEW_SECRET>` returns every door
 * unlocked, regardless of the current date.
 */
export async function GET(request: Request): Promise<NextResponse<PublicDay[]>> {
  const { searchParams } = new URL(request.url);
  const preview = isPreviewRequest(searchParams.get("preview"), process.env.PREVIEW_SECRET);

  const unlockedThrough = preview ? days.length : getUnlockedThroughDay();
  const calendarDate = getCalendarDate();

  const payload = [...days]
    .sort((a, b) => a.day - b.day)
    .map((day) => toPublicDay(day, unlockedThrough));

  return NextResponse.json(payload, {
    headers: {
      // A preview response is personal and must never be cached anywhere.
      "Cache-Control": preview
        ? "no-store"
        : "public, s-maxage=60, stale-while-revalidate=300",
      "X-Calendar-Date": calendarDate.isoDate,
      "X-Calendar-Unlocked-Through": String(unlockedThrough),
      "X-Calendar-Preview": String(preview),
    },
  });
}
