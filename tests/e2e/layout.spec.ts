import { expect, test } from "@playwright/test";

import { openPage, PREVIEW, VIEWPORTS, WINDOW } from "./helpers";

const COLUMNS = { mobile: 2, tablet: 4, desktop: 4 } as const;
const WIN_SIZE = { mobile: [44, 56], desktop: [60, 76] } as const;

for (const [name, viewport] of Object.entries(VIEWPORTS) as [keyof typeof VIEWPORTS, { width: number; height: number }][]) {
  test.describe(`${name} ${viewport.width}px`, () => {
    test.use({ viewport });

    test("houses sit in the expected number of columns", async ({ page }) => {
      await openPage(page);
      const lefts = await page.$$eval(":is([class*='__win '], [class$='__win'])", (els) =>
        els.map((e) => Math.round(e.getBoundingClientRect().left)),
      );
      expect(lefts).toHaveLength(24);
      // 3 windows per house => distinct house columns = distinct left edges / 3.
      const houses = await page.$$eval(":is([class*='__house '], [class$='__house'])", (els) =>
        els.map((e) => Math.round(e.getBoundingClientRect().left / 20)),
      );
      expect(new Set(houses).size).toBe(COLUMNS[name]);
    });

    test("no horizontal overflow and nothing clipped at the sides", async ({ page }) => {
      await openPage(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const boxes = await page.$$eval(WINDOW, (els) =>
        els.map((e) => e.getBoundingClientRect()).map((r) => ({ l: r.left, r: r.right })),
      );
      for (const box of boxes) {
        expect(box.l).toBeGreaterThanOrEqual(0);
        expect(box.r).toBeLessThanOrEqual(viewport.width);
      }
    });

    test("every window is at least 44×44 with numerals of at least 17px", async ({ page }) => {
      await openPage(page);
      const stats = await page.$$eval(WINDOW, (els) =>
        els.map((e) => {
          const r = e.getBoundingClientRect();
          return { w: r.width, h: r.height, font: parseFloat(getComputedStyle(e).fontSize) };
        }),
      );
      for (const s of stats) {
        expect(s.w).toBeGreaterThanOrEqual(43.5);
        expect(s.h).toBeGreaterThanOrEqual(44);
        expect(s.font).toBeGreaterThanOrEqual(17);
      }
    });

    test("windows and houses never overlap", async ({ page }) => {
      await openPage(page);
      const rects = await page.$$eval(":is([class*='__house '], [class$='__house'])", (els) =>
        els.map((e) => {
          const r = e.getBoundingClientRect();
          return [r.left, r.top, r.right, r.bottom];
        }),
      );
      for (let i = 0; i < rects.length; i += 1) {
        for (let j = i + 1; j < rects.length; j += 1) {
          const [a, b] = [rects[i], rects[j]];
          const overlap = a[0] < b[2] - 0.5 && b[0] < a[2] - 0.5 && a[1] < b[3] - 0.5 && b[1] < a[3] - 0.5;
          expect(overlap, `house ${i} overlaps house ${j}`).toBe(false);
        }
      }
    });

    test("the language control and progress capsule are 44px+ touch targets", async ({ page }) => {
      await openPage(page);
      for (const name of ["Deutsch", "Italiano", "English", "中文"]) {
        const box = await page.getByRole("button", { name }).boundingBox();
        expect(box!.width).toBeGreaterThanOrEqual(44);
        expect(box!.height).toBeGreaterThanOrEqual(44);
      }
    });
  });
}

test.describe("breakpoint specifics", () => {
  test("phone windows are 44×56 and desktop windows 60×76", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await openPage(page);
    const phone = await page.locator(WINDOW).first().boundingBox();
    expect([Math.round(phone!.width), Math.round(phone!.height)]).toEqual(WIN_SIZE.mobile);

    await page.setViewportSize(VIEWPORTS.desktop);
    await page.reload();
    await page.waitForSelector(WINDOW);
    const desk = await page.locator(WINDOW).first().boundingBox();
    expect([Math.round(desk!.width), Math.round(desk!.height)]).toEqual(WIN_SIZE.desktop);
  });

  test("the desktop container is capped at 1120px and the scene spans the full width", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await openPage(page);
    const inner = await page.locator(":is([class*='__inner '], [class$='__inner'])").boundingBox();
    expect(inner!.width).toBeLessThanOrEqual(1120);
    const scene = await page.locator(":is([class*='__scene '], [class$='__scene'])").boundingBox();
    expect(Math.round(scene!.width)).toBe(1600);
  });

  test("windows are arched at the top and flat at the bottom", async ({ page }) => {
    await openPage(page);
    const radius = await page.locator(WINDOW).first().evaluate((e) => {
      const s = getComputedStyle(e);
      return [s.borderTopLeftRadius, s.borderBottomLeftRadius];
    });
    expect(parseFloat(radius[0])).toBeGreaterThan(20);
    expect(radius[1]).toBe("3px");
  });

  test("the page causes no meaningful layout shift after load", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { cls: number }).cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as { hadRecentInput: boolean; value: number }[]) {
          if (!entry.hadRecentInput) (window as unknown as { cls: number }).cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.setViewportSize(VIEWPORTS.mobile);
    await openPage(page);
    await page.waitForTimeout(1500);
    const cls = await page.evaluate(() => (window as unknown as { cls: number }).cls);
    expect(cls).toBeLessThan(0.1);
  });

  test("with every door locked, windows are disabled and a click shows the hint", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    // No preview secret: before December the API masks all 24 doors.
    await page.goto("/");
    await page.waitForSelector(WINDOW);
    const locked = await page.locator(`${WINDOW}[aria-disabled='true']`).count();
    if (locked === 24) {
      // aria-disabled (not `disabled`) so the hint toast still fires; force skips
      // Playwright's own "enabled" actionability check.
      await page.locator(WINDOW).first().click({ force: true });
      await expect(page.getByText(/öffnet sich erst am/)).toBeVisible();
      await expect(page.getByRole("dialog")).toHaveCount(0);
    } else {
      test.skip(true, "Date is inside the real season: doors are legitimately unlocked.");
    }
  });
});

test("the preview URL is the only way these tests see unlocked doors", async ({ page }) => {
  await page.goto(PREVIEW);
  await page.waitForSelector(WINDOW);
  expect(await page.locator(`${WINDOW}[aria-disabled='true']`).count()).toBe(0);
});
