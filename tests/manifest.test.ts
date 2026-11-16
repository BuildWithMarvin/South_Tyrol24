import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

import manifest from "../app/manifest.ts";

test("manifest declares the installable app identity", () => {
  const m = manifest();
  assert.equal(m.name, "Südtirol Adventskalender");
  assert.equal(m.short_name, "Südtirol 24");
  assert.equal(m.start_url, "/");
  assert.equal(m.display, "standalone");
  assert.equal(m.background_color, "#151830");
  assert.equal(m.theme_color, "#151830");
});

test("every manifest icon and the Apple touch icon exist in public/", () => {
  const icons = manifest().icons ?? [];
  assert.deepEqual(icons.map((i) => i.sizes), ["192x192", "512x512"]);
  for (const icon of icons) {
    assert.ok(existsSync(new URL(`../public${icon.src}`, import.meta.url)), icon.src);
  }
  assert.ok(existsSync(new URL("../public/apple-touch-icon.png", import.meta.url)));
});

function pngSize(path: string) {
  const buf = readFileSync(new URL(`../public/${path}`, import.meta.url));
  assert.equal(buf.subarray(1, 4).toString("ascii"), "PNG", `${path} is not a PNG`);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

test("icon PNGs have the exact pixel dimensions the manifest declares", () => {
  assert.deepEqual(pngSize("icon-192.png"), { width: 192, height: 192 });
  assert.deepEqual(pngSize("icon-512.png"), { width: 512, height: 512 });
  assert.deepEqual(pngSize("apple-touch-icon.png"), { width: 180, height: 180 });
});
