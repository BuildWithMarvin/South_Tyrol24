import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

import type { DayData } from "../lib/types.ts";

const dataUrl = new URL("../data/suedtirol.json", import.meta.url);
const imagesUrl = new URL("../public/images/", import.meta.url);

const days = JSON.parse(readFileSync(dataUrl, "utf8")) as DayData[];
const imageFiles = readdirSync(imagesUrl).sort();

const LOCALES = ["de", "en", "it", "zh"] as const;

const EXPECTED_ORDER = [
  "Drei Zinnen",
  "Pragser Wildsee",
  "Schloss Tirol",
  "Seiser Alm",
  "Karersee",
  "Reschensee mit Kirchturm",
  "Die Gärten von Schloss Trauttmansdorff",
  "Ötzi-Museum & Laubengasse",
  "Seceda-Kamm",
  "Erdpyramiden von Ritten",
  "St. Magdalena im Villnößtal",
  "Messner Mountain Museum Firmian",
  "Reinbach-Wasserfälle",
  "Brixner Dom & Hofburg",
  "Kloster Neustift",
  "Gilfenklamm",
  "Kalterer See & Südtiroler Weinstraße",
  "Tappeinerweg",
  "Bletterbachschlucht",
  "Plattkofel & Langkofel",
  "Passeiertal & Sandwirt",
  "Spronser Seen",
  "Fragsburg & Schloss Katzenzungen",
  "Christkindlmarkt Bozen & Meran",
];

test("the dataset contains exactly 24 doors in the required order", () => {
  assert.equal(days.length, 24);
  assert.deepEqual(
    days.map((day) => day.day),
    Array.from({ length: 24 }, (_, index) => index + 1),
  );
  assert.deepEqual(
    days.map((day) => day.location.name),
    EXPECTED_ORDER,
  );
});

test("every door has a unique slug in kebab-case", () => {
  const slugs = days.map((day) => day.slug);
  assert.equal(new Set(slugs).size, 24);

  for (const slug of slugs) {
    assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  }
});

test("every door has complete content in all four locales", () => {
  for (const day of days) {
    assert.deepEqual(
      Object.keys(day.content).sort(),
      [...LOCALES],
      `day ${day.day}: wrong locale set`,
    );

    for (const locale of LOCALES) {
      const content = day.content[locale];
      assert.ok(content.title.length > 0, `day ${day.day}/${locale}: title`);
      assert.ok(content.region.length > 0, `day ${day.day}/${locale}: region`);
      assert.ok(
        content.description.length > 30,
        `day ${day.day}/${locale}: description too short`,
      );
    }
  }
});

test("coordinates are plausible for South Tyrol and match the Maps link", () => {
  for (const day of days) {
    const { lat, lng, mapsUrl } = day.location;
    assert.ok(lat > 46.2 && lat < 47.1, `day ${day.day}: latitude ${lat}`);
    assert.ok(lng > 10.4 && lng < 12.5, `day ${day.day}: longitude ${lng}`);
    assert.equal(
      mapsUrl,
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    );
  }
});

test("every imageUrl uses the local image directory and the file exists", () => {
  const webpFiles = imageFiles.filter((file) => file.endsWith(".webp"));
  assert.equal(webpFiles.length, 24);

  for (const day of days) {
    const match = /^\/images\/Day-(\d{2})-([A-Za-z0-9]{8})\.webp$/.exec(
      day.imageUrl,
    );
    assert.ok(match, `day ${day.day}: unexpected imageUrl ${day.imageUrl}`);

    const dayPart = String(day.day).padStart(2, "0");
    assert.equal(match[1], dayPart, `day ${day.day}: wrong file prefix`);
    assert.ok(
      existsSync(new URL(`../public${day.imageUrl}`, import.meta.url)),
      `day ${day.day}: missing ${day.imageUrl}`,
    );
  }
});

test("every door carries a structured, HTML-free image credit", () => {
  const policies = {
    Unsplash: {
      license: "Unsplash License",
      licenseUrl: "https://unsplash.com/license",
      urlPrefix: "https://unsplash.com/",
    },
    Pixabay: {
      license: "Pixabay License",
      licenseUrl: "https://pixabay.com/service/license-summary/",
      urlPrefix: "https://pixabay.com/",
    },
    Pexels: {
      license: "Pexels License",
      licenseUrl: "https://www.pexels.com/license/",
      urlPrefix: "https://www.pexels.com/",
    },
  } as const;

  for (const day of days) {
    const credit = day.imageCredit;
    assert.ok(credit, `day ${day.day}: missing imageCredit`);
    assert.ok(credit.author.length > 0, `day ${day.day}: missing author`);
    assert.ok(credit.source.length > 0, `day ${day.day}: missing source`);

    for (const value of Object.values(credit)) {
      assert.ok(
        !value.includes("<") && !value.includes(">"),
        `day ${day.day}: raw HTML in credit`,
      );
    }

    if (credit.source === "Wikimedia Commons") {
      assert.match(credit.license ?? "", /^CC BY(-SA)? \d\.\d$/);
      assert.match(
        credit.licenseUrl ?? "",
        /^https:\/\/creativecommons\.org\/licenses\//,
      );
      assert.match(
        credit.sourceUrl ?? "",
        /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/,
      );
      continue;
    }

    const policy = policies[credit.source as keyof typeof policies];
    assert.ok(policy, `day ${day.day}: unknown source ${credit.source}`);
    assert.equal(credit.license, policy.license);
    assert.equal(credit.licenseUrl, policy.licenseUrl);
    assert.ok(
      credit.sourceUrl?.startsWith(policy.urlPrefix),
      `day ${day.day}: unexpected sourceUrl ${credit.sourceUrl}`,
    );
  }
});
