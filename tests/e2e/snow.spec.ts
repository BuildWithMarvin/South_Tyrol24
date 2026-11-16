import { expect, test } from "@playwright/test";

import { openPage, VIEWPORTS } from "./helpers";

test("snow is decorative: fixed, click-through, behind the village and above the mountains", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.desktop);
  await openPage(page);

  const info = await page.evaluate(() => {
    const layers = [...document.querySelectorAll<HTMLElement>("[data-paused]")];
    const content = document.querySelector<HTMLElement>(":is([class*='__content '], [class$='__content'])")!;
    return {
      layers: layers.map((l) => {
        const s = getComputedStyle(l);
        return { pos: s.position, events: s.pointerEvents, z: Number(s.zIndex), hidden: l.getAttribute("aria-hidden") };
      }),
      content: Number(getComputedStyle(content).zIndex),
    };
  });

  expect(info.layers).toHaveLength(2);
  for (const layer of info.layers) {
    expect(layer.pos).toBe("fixed");
    expect(layer.events).toBe("none");
    expect(layer.hidden).toBe("true");
  }
  const [back, near] = info.layers.sort((a, b) => a.z - b.z);
  expect(back.z).toBeGreaterThan(0);
  expect(back.z).toBeLessThan(info.content);
  expect(near.z).toBeGreaterThan(info.content);
});

test("windows stay clickable through the snow", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.mobile);
  await openPage(page);
  await page.getByRole("button", { name: /^Türchen 7:/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("flakes are small, semi-transparent warm white, and animate", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.desktop);
  await openPage(page);
  await page.waitForSelector(":is([class*='__flake '], [class$='__flake'])");
  const flakes = await page.$$eval(":is([class*='__flake '], [class$='__flake'])", (els) =>
    els.map((e) => {
      const s = getComputedStyle(e);
      return {
        size: parseFloat(s.width),
        opacity: Number(s.opacity),
        anim: s.animationName,
        delay: parseFloat(s.animationDelay),
        state: s.animationPlayState,
      };
    }),
  );
  expect(flakes.length).toBe(70);
  expect(flakes.every((f) => f.size <= 8 && f.opacity <= 0.8)).toBe(true);
  expect(flakes.every((f) => f.anim.includes("snowFall") && f.delay <= 0 && f.state === "running")).toBe(true);
});

test("flakes actually move over time", async ({ page }) => {
  await openPage(page);
  const sample = () =>
    page.$eval(":is([class*='__flake '], [class$='__flake'])", (e) => e.getBoundingClientRect().top);
  const a = await sample();
  await page.waitForTimeout(800);
  expect(await sample()).not.toBe(a);
});

test("snow pauses while the tab is hidden", async ({ page }) => {
  await openPage(page);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { value: true, configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("[data-paused='true']").first()).toBeAttached();
  expect(
    await page.$eval(":is([class*='__flake '], [class$='__flake'])", (e) => getComputedStyle(e).animationPlayState),
  ).toBe("paused");
});

test.describe("prefers-reduced-motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("no flake animates, only a few static dots are drawn, and the today pulse is off", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await openPage(page);
    const flakes = await page.$$eval(":is([class*='__flake '], [class$='__flake'])", (els) =>
      els.map((e) => getComputedStyle(e).animationName),
    );
    expect(flakes.length).toBeLessThanOrEqual(8);
    expect(flakes.every((n) => n === "none")).toBe(true);

    // Door 24 is "today" in preview mode.
    const pulse = await page
      .getByRole("button", { name: /^Türchen 24:/ })
      .evaluate((e) => getComputedStyle(e).animationName);
    expect(pulse).toBe("none");
  });
});

test("outside reduced motion the today window pulses", async ({ page }) => {
  await openPage(page);
  const pulse = await page
    .getByRole("button", { name: /^Türchen 24:/ })
    .evaluate((e) => getComputedStyle(e).animationName);
  expect(pulse).toContain("pulse");
});
