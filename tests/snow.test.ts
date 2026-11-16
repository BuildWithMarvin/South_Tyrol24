import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createFlakes,
  SNOW_SPEC,
  STILL_DOT_COUNT,
  type SnowDepth,
} from "../lib/snow.ts";

const ALL: SnowDepth[] = ["far", "mid", "near"];
const count = (flakes: ReturnType<typeof createFlakes>, depth: SnowDepth) =>
  flakes.filter((f) => f.depth === depth).length;

test("phones get about 40 flakes (22 far, 14 mid, 4 near)", () => {
  const flakes = createFlakes(ALL, false, false);
  assert.equal(flakes.length, 40);
  assert.equal(count(flakes, "far"), 22);
  assert.equal(count(flakes, "mid"), 14);
  assert.equal(count(flakes, "near"), 4);
});

test("screens from 640px get about 70 flakes", () => {
  assert.equal(createFlakes(ALL, true, false).length, 70);
});

test("the back layer excludes near flakes and vice versa", () => {
  const back = createFlakes(["far", "mid"], true, false);
  assert.equal(count(back, "near"), 0);
  const near = createFlakes(["near"], true, false);
  assert.ok(near.every((f) => f.depth === "near"));
});

test("every flake stays inside its depth's size, opacity and duration ranges", () => {
  for (const flake of createFlakes(ALL, true, false)) {
    const spec = SNOW_SPEC[flake.depth];
    assert.ok(flake.size >= spec.size[0] && flake.size <= spec.size[1]);
    assert.ok(flake.opacity >= spec.opacity[0] && flake.opacity <= spec.opacity[1]);
    assert.ok(flake.duration >= spec.dur[0] && flake.duration <= spec.dur[1]);
    assert.ok(Math.abs(flake.sway) >= spec.sway[0] && Math.abs(flake.sway) <= spec.sway[1]);
    assert.equal(flake.blur, spec.blur);
    assert.ok(flake.left >= 0 && flake.left <= 100);
  }
});

test("only the near layer is blurred, and it stays sparse and semi-transparent", () => {
  const flakes = createFlakes(ALL, true, false);
  assert.ok(flakes.filter((f) => f.depth !== "near").every((f) => f.blur === 0));
  assert.ok(count(flakes, "near") <= 8);
  assert.ok(flakes.every((f) => f.opacity <= 0.8));
});

test("delays are negative and within one fall, so snow is present on first paint", () => {
  for (const flake of createFlakes(ALL, true, false)) {
    assert.ok(flake.delay <= 0 && flake.delay >= -flake.duration);
  }
});

test("flakes use the warm-white palette and sway both ways", () => {
  const flakes = createFlakes(ALL, true, false);
  assert.ok(flakes.every((f) => ["#f6efd8", "#ffffff"].includes(f.color)));
  assert.ok(flakes.some((f) => f.sway < 0) && flakes.some((f) => f.sway > 0));
});

test("reduced motion yields only a few static far dots", () => {
  const flakes = createFlakes(ALL, true, true);
  assert.equal(flakes.length, STILL_DOT_COUNT);
  assert.ok(flakes.every((f) => f.depth === "far" && f.top !== undefined));
  assert.equal(createFlakes(["near"], true, true).length, 0);
});

test("a seeded random source makes generation deterministic", () => {
  const seeded = () => {
    let n = 0.37;
    return () => (n = (n * 9301 + 0.49297) % 1);
  };
  assert.deepEqual(
    createFlakes(ALL, false, false, seeded()),
    createFlakes(ALL, false, false, seeded()),
  );
});
