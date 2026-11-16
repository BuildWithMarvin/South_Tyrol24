import { expect, test } from "@playwright/test";

import { contrast, openDoor, openPage, VIEWPORTS } from "./helpers";

test.describe("phone: bottom sheet", () => {
  test.use({ viewport: VIEWPORTS.mobile });

  test("fills the width, sits at the bottom with 24px top corners and 92dvh max height", async ({ page }) => {
    await openPage(page);
    await openDoor(page, 1);
    const dialog = page.getByRole("dialog");
    await dialog.evaluate((e) => Promise.all(e.getAnimations().map((a) => a.finished)));
    const box = (await dialog.boundingBox())!;
    expect(Math.round(box.width)).toBe(390);
    expect(Math.round(box.y + box.height)).toBe(844);
    expect(box.height).toBeLessThanOrEqual(844 * 0.92 + 1);
    expect(await dialog.evaluate((e) => getComputedStyle(e).borderTopLeftRadius)).toBe("24px");
  });

  test("the support buttons are subtle: compact, outlined, within the content width", async ({ page }) => {
    await openPage(page);
    await openDoor(page, 1);
    const donate = page.getByRole("dialog").getByRole("link", { name: /Buy Me a Coffee/ });
    await donate.scrollIntoViewIfNeeded();
    const box = (await donate.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(40);
    expect(box.height).toBeLessThan(48);
    const actions = (await page.locator(":is([class*='__modalActions '], [class$='__modalActions'])").boundingBox())!;
    expect(box.width).toBeLessThanOrEqual(actions.width + 1);
    const bg = await donate.evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(bg).toBe("rgba(0, 0, 0, 0)");
  });

  test("the sheet's content scrolls while the page behind does not", async ({ page }) => {
    await openPage(page);
    await openDoor(page, 1);
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");
    const scrolls = await page
      .locator(":is([class*='__modalContent '], [class$='__modalContent'])")
      .evaluate((e) => e.scrollHeight > e.clientHeight);
    expect(scrolls).toBe(true);
  });
});

test.describe("desktop: centred card", () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test("is centred, max 720px wide, with 20px corners and a dimmed, blurred backdrop", async ({ page }) => {
    await openPage(page);
    await openDoor(page, 1);
    const dialog = page.getByRole("dialog");
    await dialog.evaluate((e) => Promise.all(e.getAnimations().map((a) => a.finished)));
    const box = (await dialog.boundingBox())!;
    expect(Math.round(box.width)).toBe(720);
    expect(Math.round(box.x + box.width / 2)).toBe(640);
    expect(await dialog.evaluate((e) => getComputedStyle(e).borderTopLeftRadius)).toBe("20px");

    const backdrop = await dialog.evaluate((e) => {
      const s = getComputedStyle(e.parentElement!);
      return { bg: s.backgroundColor, blur: s.backdropFilter };
    });
    expect(backdrop.bg).toBe("rgba(8, 10, 24, 0.7)");
    expect(backdrop.blur).toContain("blur");
  });

  test("photo keeps its arch, is taller than before, and there is no embedded map", async ({ page }) => {
    await openPage(page);
    await openDoor(page, 1);
    expect(await page.locator("figure").evaluate((e) => getComputedStyle(e).borderTopLeftRadius)).toBe("150px");
    await expect(page.locator("[role=dialog] iframe")).toHaveCount(0);

    const fig = (await page.locator("figure").boundingBox())!;
    expect(fig.height / fig.width).toBeGreaterThan(0.8);

    const order = await page.$$eval(":is([class*='__modalContent '], [class$='__modalContent']) > *", (els) =>
      els.map((e) => (e.className.split("__").pop() ?? "").split(" ")[0] || e.tagName.toLowerCase()),
    );
    expect(order).toEqual([
      "figure",
      "modalTitle",
      "modalRegion",
      "locationLink",
      "photoCredit",
      "modalDescription",
      "modalActions",
    ]);
  });

  test("body text is 18px / 1.65 with a readable line length", async ({ page }) => {
    await openPage(page);
    await openDoor(page, 1);
    const text = page.locator(":is([class*='__modalDescription '], [class$='__modalDescription'])");
    const style = await text.evaluate((e) => {
      const s = getComputedStyle(e);
      return { size: s.fontSize, line: parseFloat(s.lineHeight), width: e.getBoundingClientRect().width };
    });
    expect(style.size).toBe("18px");
    expect(style.line).toBeCloseTo(29.7, 1);
    expect(style.width).toBeLessThanOrEqual(62 * 18);
  });

  test("text, credit and button colours meet 4.5:1 contrast on the night sheet", async ({ page }) => {
    await openPage(page);
    await openDoor(page, 1);
    const colours = await page.evaluate(() => {
      const c = (sel: string) => getComputedStyle(document.querySelector(sel)!).color;
      return {
        sheet: getComputedStyle(document.querySelector("[role=dialog]")!).backgroundColor,
        body: c(":is([class*='__modalDescription '], [class$='__modalDescription'])"),
        credit: c(":is([class*='__photoCredit '], [class$='__photoCredit'])"),
        region: c(":is([class*='__modalRegion '], [class$='__modalRegion'])"),
        donateBg: getComputedStyle(document.querySelector(":is([class*='__modalDonate '], [class$='__modalDonate'])")!).backgroundColor,
        donateFg: c(":is([class*='__modalDonate '], [class$='__modalDonate'])"),
      };
    });
    expect(contrast(colours.body, colours.sheet)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colours.credit, colours.sheet)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colours.region, colours.sheet)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colours.donateFg, colours.sheet)).toBeGreaterThanOrEqual(4.5);
  });

  test("close is a 44×44 round button and Esc / backdrop close the modal", async ({ page }) => {
    await openPage(page);
    await openDoor(page, 1);
    const close = (await page.getByRole("button", { name: "Schließen" }).boundingBox())!;
    expect([Math.round(close.width), Math.round(close.height)]).toEqual([44, 44]);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await openDoor(page, 2);
    await page.mouse.click(20, 20);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("real focus trap: Tab and Shift+Tab never leave the dialog, and focus returns to the window", async ({ page }) => {
    await openPage(page);
    const opener = page.getByRole("button", { name: /^Türchen 4:/ });
    await opener.click();
    await page.waitForSelector("[role=dialog] figure img");

    const insideDialog = () =>
      page.evaluate(() => !!document.activeElement?.closest("[role=dialog]"));
    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press("Tab");
      expect(await insideDialog()).toBe(true);
    }
    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press("Shift+Tab");
      expect(await insideDialog()).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(opener).toBeFocused();
  });
});

test("the modal is readable over the snow: near layer sits below the backdrop", async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.desktop);
  await openPage(page);
  await openDoor(page, 1);
  const z = await page.evaluate(() => {
    const layers = [...document.querySelectorAll("[data-paused]")] as HTMLElement[];
    const backdrop = document.querySelector("[role=dialog]")!.parentElement!;
    return {
      snow: layers.map((l) => Number(getComputedStyle(l).zIndex)),
      backdrop: Number(getComputedStyle(backdrop).zIndex),
    };
  });
  expect(z.snow.length).toBe(2);
  for (const value of z.snow) {
    expect(value).toBeLessThan(z.backdrop);
  }
  const top = await page.evaluate(() => {
    const el = document.elementFromPoint(640, 400);
    return !!el?.closest("[role=dialog]");
  });
  expect(top).toBe(true);
});

test("the Maps link is visible without scrolling, with the location's URL", async ({ page }) => {
  for (const viewport of [VIEWPORTS.mobile, VIEWPORTS.desktop]) {
    await page.setViewportSize(viewport);
    await page.goto("/?preview=e2e-secret");
    await page.waitForSelector("button[aria-label^='Türchen']");
    await openDoor(page, 1);
    const link = page.locator(":is([class*='__locationLink '], [class$='__locationLink'])");
    await expect(link).toBeVisible();
    const box = (await link.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    expect(box.height).toBeGreaterThanOrEqual(44);
    const href = await link.getAttribute("href");
    expect(href).toMatch(/^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=46\.6186,12\.3055$/);
  }
});
