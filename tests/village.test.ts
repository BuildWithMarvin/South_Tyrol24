import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ADVENT_DAYS,
  getTodayDoor,
  HOUSES,
  HOUSE_BODIES,
  HOUSE_OFFSETS,
} from "../lib/village.ts";

test("the village has 8 houses with 3 windows each", () => {
  assert.equal(HOUSES.length, 8);
  for (const house of HOUSES) {
    assert.equal(house.length, 3);
  }
});

test("every door 1–24 appears exactly once", () => {
  const all = HOUSES.flat().sort((a, b) => a - b);
  assert.deepEqual(
    all,
    Array.from({ length: 24 }, (_, i) => i + 1),
  );
});

test("the order is shuffled, not sequential", () => {
  assert.notDeepEqual(
    HOUSES.flat(),
    Array.from({ length: 24 }, (_, i) => i + 1),
  );
});

test("every house has a body colour and a stagger offset", () => {
  assert.equal(HOUSE_BODIES.length, HOUSES.length);
  assert.equal(HOUSE_OFFSETS.length, HOUSES.length);
  for (const colour of HOUSE_BODIES) {
    assert.match(colour, /^#[0-9a-f]{6}$/i);
  }
  assert.ok(new Set(HOUSE_OFFSETS).size > 1, "offsets must vary");
});

test("the Advent Sundays are 6, 13 and 20", () => {
  assert.deepEqual([...ADVENT_DAYS].sort((a, b) => a - b), [6, 13, 20]);
});

test("today's door is the highest unlocked day", () => {
  const days = Array.from({ length: 24 }, (_, i) => ({
    day: i + 1,
    isLocked: i + 1 > 8,
  }));
  assert.equal(getTodayDoor(days), 8);
});

test("today's door is 0 when everything is locked and 24 when preview unlocks all", () => {
  const make = (locked: boolean) =>
    Array.from({ length: 24 }, (_, i) => ({ day: i + 1, isLocked: locked }));
  assert.equal(getTodayDoor(make(true)), 0);
  assert.equal(getTodayDoor(make(false)), 24);
  assert.equal(getTodayDoor([]), 0);
});
