import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InstallPrompt } from "../../app/components/InstallPrompt";
import { UI } from "../../lib/i18n";

const KEY = "suedtirol-install-dismissed";

function stubEnv({
  touch = true,
  standalone = false,
  ua = "Mozilla/5.0 (Linux; Android 14)",
}: { touch?: boolean; standalone?: boolean; ua?: string } = {}) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: query.includes("display-mode") ? standalone : touch,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue(ua);
}

function fireInstallPrompt() {
  const event = Object.assign(new Event("beforeinstallprompt", { cancelable: true }), {
    prompt: vi.fn().mockResolvedValue(undefined),
    userChoice: Promise.resolve({ outcome: "accepted" as const }),
  });
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
}

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1";

describe("InstallPrompt", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stays hidden on Android until the browser offers installation", () => {
    stubEnv();
    render(<InstallPrompt copy={UI.en} />);
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("offers a native install button and triggers the browser prompt", async () => {
    stubEnv();
    render(<InstallPrompt copy={UI.en} />);
    const event = fireInstallPrompt();
    expect(event.defaultPrevented).toBe(true);

    await userEvent.click(await screen.findByRole("button", { name: "Add to Home Screen" }));
    expect(event.prompt).toHaveBeenCalledOnce();
    await vi.waitFor(() => expect(screen.queryByRole("region")).toBeNull());
  });

  it("shows step-by-step Share instructions on iOS", () => {
    stubEnv({ ua: IPHONE });
    const { container } = render(<InstallPrompt copy={UI.en} />);
    const steps = screen.getAllByRole("listitem");
    expect(steps).toHaveLength(2);
    expect(steps[0]).toHaveTextContent("Tap the Share icon");
    expect(steps[0].querySelector("svg")).not.toBeNull();
    expect(steps[1]).toHaveTextContent("Add to Home Screen");
    expect(container.querySelector("button")?.textContent).toBe("Close");
  });

  it("is hidden when already running as an installed app", () => {
    stubEnv({ ua: IPHONE, standalone: true });
    render(<InstallPrompt copy={UI.en} />);
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("is hidden on non-touch (desktop) devices", () => {
    stubEnv({ ua: IPHONE, touch: false });
    render(<InstallPrompt copy={UI.en} />);
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("closing hides it permanently via localStorage", async () => {
    stubEnv({ ua: IPHONE });
    const first = render(<InstallPrompt copy={UI.de} />);
    await userEvent.click(screen.getByRole("button", { name: "Schließen" }));
    expect(screen.queryByRole("region")).toBeNull();
    expect(window.localStorage.getItem(KEY)).toBe("1");
    first.unmount();

    render(<InstallPrompt copy={UI.de} />);
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("is localized in every language", () => {
    for (const locale of ["de", "it", "en", "zh"] as const) {
      expect(UI[locale].installIosShare).toContain("{icon}");
      expect(UI[locale].installTitle.length).toBeGreaterThan(0);
    }
    stubEnv({ ua: IPHONE });
    render(<InstallPrompt copy={UI.zh} />);
    expect(screen.getByRole("heading", { name: "将应用添加到主屏幕" })).toBeInTheDocument();
  });
});
