import assert from "node:assert/strict";
import { test } from "node:test";

import { toPublicDay } from "../lib/masking.ts";
import type { DayData } from "../lib/types.ts";

const sample: DayData = {
  day: 5,
  slug: "karersee",
  imageUrl: "/images/Day-05-feaEL6jq.webp",
  imageCredit: {
    author: "Test Author",
    source: "Unsplash",
    sourceUrl: "https://unsplash.com/de/@test",
    license: "Unsplash License",
    licenseUrl: "https://unsplash.com/license",
  },
  location: {
    name: "Karersee",
    lat: 46.4092,
    lng: 11.5956,
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=46.4092,11.5956",
  },
  content: {
    de: { title: "Karersee", region: "Eggental", description: "Deutsch" },
    it: { title: "Lago di Carezza", region: "Val d'Ega", description: "Italiano" },
    en: { title: "Lake Carezza", region: "Eggental Valley", description: "English" },
    zh: { title: "卡雷扎湖", region: "埃根谷", description: "中文" },
  },
};

test("an unlocked door exposes all data, including the image credit", () => {
  const result = toPublicDay(sample, 5);

  assert.equal(result.isLocked, false);
  assert.deepEqual(result, { ...sample, isLocked: false });
});

test("a locked door exposes only its number and lock flag", () => {
  const result = toPublicDay(sample, 4);

  assert.deepEqual(result, { day: 5, isLocked: true });
  assert.deepEqual(Object.keys(result).sort(), ["day", "isLocked"]);
});

test("a locked door serialises no content, location, image or credit", () => {
  const serialised = JSON.stringify(toPublicDay(sample, 0));

  for (const secret of [
    "Karersee",
    "Lake Carezza",
    "卡雷扎湖",
    "content",
    "location",
    "imageUrl",
    "imageCredit",
    "Day-05",
    "Test Author",
    "Eggental",
  ]) {
    assert.ok(
      !serialised.includes(secret),
      `locked response leaks: ${secret}`,
    );
  }
});

test("the boundary day is unlocked, the next day is not", () => {
  assert.equal(toPublicDay(sample, 4).isLocked, true);
  assert.equal(toPublicDay(sample, 5).isLocked, false);
});
