import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getCalendarDate,
  getUnlockedThroughDay,
  TOTAL_DAYS,
} from "../lib/calendar.ts";

const at = (iso: string) => new Date(iso);

test("calendar date is evaluated in Europe/Rome, not UTC", () => {
  assert.deepEqual(getCalendarDate(at("2026-12-10T23:30:00Z")), {
    year: 2026,
    month: 12,
    day: 11,
    isoDate: "2026-12-11",
  });
});

test("all doors stay locked outside December", () => {
  assert.equal(getUnlockedThroughDay(at("2026-11-30T12:00:00Z")), 0);
  assert.equal(getUnlockedThroughDay(at("2026-07-15T12:00:00Z")), 0);
  assert.equal(getUnlockedThroughDay(at("2027-01-01T12:00:00Z")), 0);
});

test("December unlocks doors up to and including today", () => {
  assert.equal(getUnlockedThroughDay(at("2026-12-01T12:00:00Z")), 1);
  assert.equal(getUnlockedThroughDay(at("2026-12-05T12:00:00Z")), 5);
  assert.equal(getUnlockedThroughDay(at("2026-12-24T12:00:00Z")), 24);
});

test("December 25-31 keeps every door open", () => {
  assert.equal(getUnlockedThroughDay(at("2026-12-25T12:00:00Z")), TOTAL_DAYS);
  assert.equal(getUnlockedThroughDay(at("2026-12-31T12:00:00Z")), TOTAL_DAYS);
});

test("day 24 unlocks at Rome midnight on December 24", () => {
  // 23:30 UTC on December 23 is already 00:30 on December 24 in Rome.
  assert.equal(getUnlockedThroughDay(at("2026-12-23T23:30:00Z")), 24);
});
