import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, mock, test } from "node:test";

import { GET } from "../app/api/days/route.ts";
import type { PublicDay } from "../lib/types.ts";

const SECRET = "test-preview-secret";
const original = process.env.PREVIEW_SECRET;

/** Noon UTC is the same calendar day in Europe/Rome (winter, UTC+1). */
function freezeAt(iso: string) {
  mock.timers.enable({ apis: ["Date"], now: new Date(iso) });
}

async function call(query = "") {
  const response = await GET(new Request(`http://localhost/api/days${query}`));
  const body = (await response.json()) as PublicDay[];
  return { response, body };
}

const unlockedCount = (body: PublicDay[]) => body.filter((d) => !d.isLocked).length;

beforeEach(() => {
  process.env.PREVIEW_SECRET = SECRET;
});

afterEach(() => {
  mock.timers.reset();
  if (original === undefined) {
    delete process.env.PREVIEW_SECRET;
  } else {
    process.env.PREVIEW_SECRET = original;
  }
});

describe("GET /api/days (no preview)", () => {
  test("returns all 24 doors in calendar order", async () => {
    freezeAt("2026-12-08T12:00:00Z");
    const { body } = await call();
    assert.deepEqual(
      body.map((d) => d.day),
      Array.from({ length: 24 }, (_, i) => i + 1),
    );
  });

  test("unlocks doors up to today and masks the rest", async () => {
    freezeAt("2026-12-08T12:00:00Z");
    const { body, response } = await call();
    assert.equal(unlockedCount(body), 8);
    assert.equal(response.headers.get("X-Calendar-Unlocked-Through"), "8");
    assert.equal(response.headers.get("X-Calendar-Date"), "2026-12-08");

    const locked = body[8];
    assert.deepEqual(locked, { day: 9, isLocked: true });
  });

  test("locks everything before December so nothing can be spoiled", async () => {
    freezeAt("2026-11-16T12:00:00Z");
    const { body, response } = await call();
    assert.equal(unlockedCount(body), 0);
    assert.equal(response.headers.get("X-Calendar-Preview"), "false");
  });

  test("is publicly cacheable only for a short time", async () => {
    freezeAt("2026-12-08T12:00:00Z");
    const { response } = await call();
    assert.match(response.headers.get("Cache-Control") ?? "", /s-maxage=60/);
  });

  test("locked doors leak no content, image or location in the JSON", async () => {
    freezeAt("2026-12-01T12:00:00Z");
    const { body } = await call();
    for (const door of body.filter((d) => d.isLocked)) {
      assert.deepEqual(Object.keys(door).sort(), ["day", "isLocked"]);
    }
  });

  test("uses the South Tyrol date, not UTC, around midnight", async () => {
    // 23:30 UTC on 7 Dec is already 00:30 on 8 Dec in Europe/Rome.
    freezeAt("2026-12-07T23:30:00Z");
    const { response } = await call();
    assert.equal(response.headers.get("X-Calendar-Unlocked-Through"), "8");
  });
});

describe("GET /api/days (preview bypass)", () => {
  test("the correct secret unlocks all 24 doors regardless of date", async () => {
    freezeAt("2026-11-16T12:00:00Z");
    const { body, response } = await call(`?preview=${SECRET}`);
    assert.equal(unlockedCount(body), 24);
    assert.equal(response.headers.get("X-Calendar-Preview"), "true");
    assert.equal(response.headers.get("X-Calendar-Unlocked-Through"), "24");
  });

  test("preview responses are never cached", async () => {
    freezeAt("2026-11-16T12:00:00Z");
    const { response } = await call(`?preview=${SECRET}`);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
  });

  test("unlocked doors carry full content, credit and location", async () => {
    freezeAt("2026-11-16T12:00:00Z");
    const { body } = await call(`?preview=${SECRET}`);
    const first = body[0];
    assert.ok(!first.isLocked);
    if (!first.isLocked) {
      assert.ok(first.imageUrl);
      assert.ok(first.location.mapsUrl);
      for (const locale of ["de", "it", "en", "zh"] as const) {
        assert.ok(first.content[locale].title);
      }
    }
  });

  test("a wrong secret is ignored", async () => {
    freezeAt("2026-11-16T12:00:00Z");
    const { body, response } = await call("?preview=wrong");
    assert.equal(unlockedCount(body), 0);
    assert.equal(response.headers.get("X-Calendar-Preview"), "false");
  });

  test("a secret of a different length is ignored without throwing", async () => {
    freezeAt("2026-11-16T12:00:00Z");
    for (const value of ["x", `${SECRET}extra`, SECRET.slice(0, -1)]) {
      const { response } = await call(`?preview=${value}`);
      assert.equal(response.headers.get("X-Calendar-Preview"), "false");
    }
  });

  test("an empty preview value is ignored", async () => {
    freezeAt("2026-11-16T12:00:00Z");
    const { response } = await call("?preview=");
    assert.equal(response.headers.get("X-Calendar-Preview"), "false");
  });

  test("without a configured PREVIEW_SECRET the bypass is disabled", async () => {
    freezeAt("2026-11-16T12:00:00Z");
    delete process.env.PREVIEW_SECRET;
    for (const query of ["?preview=", "?preview=undefined", `?preview=${SECRET}`]) {
      const { response } = await call(query);
      assert.equal(response.headers.get("X-Calendar-Preview"), "false");
    }
  });
});
