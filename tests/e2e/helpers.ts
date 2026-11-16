import type { Page } from "@playwright/test";

export const PREVIEW = "/?preview=e2e-secret";
export const WINDOW = "button[aria-label^='Türchen']";

export const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 820, height: 1180 },
  desktop: { width: 1280, height: 800 },
} as const;

export async function openPage(page: Page, url = PREVIEW) {
  await page.goto(url);
  await page.waitForSelector(WINDOW);
}

export async function openDoor(page: Page, day: number) {
  await page.getByRole("button", { name: new RegExp(`^Türchen ${day}:`) }).click();
  await page.waitForSelector("[role=dialog] figure img");
  await page.waitForFunction(() => {
    const img = document.querySelector<HTMLImageElement>("[role=dialog] figure img");
    return !!img && img.complete;
  });
  // Let the slide-in finish so geometry assertions are stable.
  await page
    .getByRole("dialog")
    .evaluate((e) => Promise.all(e.getAnimations().map((a) => a.finished)));
}

export function luminance(color: string): number {
  const [r, g, b] = (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
