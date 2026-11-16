import assert from "node:assert/strict";
import { test } from "node:test";

import { formatDoorDate, isLocale, LOCALES, LOCALE_LABELS, UI } from "../lib/i18n.ts";

const keys = (locale: (typeof LOCALES)[number]) => Object.keys(UI[locale]).sort();

test("all four locales are registered with uppercase labels", () => {
  assert.deepEqual([...LOCALES], ["de", "it", "en", "zh"]);
  for (const code of LOCALES) {
    assert.equal(LOCALE_LABELS[code], code.toUpperCase());
  }
});

test("every locale defines exactly the same UI keys", () => {
  for (const code of LOCALES) {
    assert.deepEqual(keys(code), keys("de"), `${code} keys differ from de`);
  }
});

test("no static UI string is empty", () => {
  for (const code of LOCALES) {
    for (const [key, value] of Object.entries(UI[code])) {
      if (typeof value === "string") {
        assert.ok(value.trim().length > 0, `${code}.${key} is empty`);
      }
    }
  }
});

test("the new door micro-label is localized", () => {
  assert.equal(UI.de.openDoorLabel, "Türchen öffnen");
  assert.equal(new Set(LOCALES.map((c) => UI[c].openDoorLabel)).size, 4);
});

test("template functions mention the day number and title", () => {
  for (const code of LOCALES) {
    const t = UI[code];
    assert.ok(t.doorAriaLocked(7, "7 X").includes("7"));
    assert.ok(t.doorAriaOpen(7, "Karersee").includes("Karersee"));
    assert.ok(t.doorAriaOpened(7, "Karersee").includes("Karersee"));
    assert.ok(t.progress(3, 24).includes("3") && t.progress(3, 24).includes("24"));
    assert.ok(t.badge(7, "7 X").includes("7"));
    assert.ok(t.lockedHint("8 X").includes("8 X"));
  }
});

test("donate copy keeps the Buy Me a Coffee name in every locale", () => {
  for (const code of LOCALES) {
    assert.ok(UI[code].donate.includes("Buy Me a Coffee"));
  }
});

test("PayPal copy is localized in every locale", () => {
  const expected = {
    de: "Per PayPal unterstützen",
    it: "Sostieni con PayPal",
    en: "Support via PayPal",
    zh: "通过 PayPal 支持",
  } as const;
  for (const code of LOCALES) assert.equal(UI[code].paypal, expected[code]);
});

test("formatDoorDate renders December dates per locale", () => {
  assert.match(formatDoorDate("de", 1), /1\.\s*Dezember/);
  assert.match(formatDoorDate("it", 24), /24\s+dicembre/);
  assert.match(formatDoorDate("en", 6), /6\s+December/);
  assert.match(formatDoorDate("zh", 13), /12月13日/);
});

test("isLocale accepts known codes only", () => {
  assert.ok(isLocale("zh"));
  assert.ok(!isLocale("fr"));
  assert.ok(!isLocale(null));
  assert.ok(!isLocale(""));
});
