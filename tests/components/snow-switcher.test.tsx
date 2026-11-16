import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LanguageSwitcher } from "../../app/components/LanguageSwitcher";
import { SnowLayer } from "../../app/components/SnowLayer";

function mockMedia({ wide = false, reduced = false } = {}) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: query.includes("min-width") ? wide : query.includes("reduced-motion") ? reduced : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

const flakes = (container: HTMLElement) => container.querySelectorAll(".flake");

afterEach(() => {
  Object.defineProperty(document, "hidden", { value: false, configurable: true });
});

describe("SnowLayer", () => {
  it("renders 36 back flakes and 4 near flakes on phones", () => {
    mockMedia();
    const back = render(<SnowLayer layer="back" />);
    const near = render(<SnowLayer layer="near" />);
    expect(flakes(back.container)).toHaveLength(36);
    expect(flakes(near.container)).toHaveLength(4);
  });

  it("renders 62 back flakes and 8 near flakes from 640px", () => {
    mockMedia({ wide: true });
    const back = render(<SnowLayer layer="back" />);
    const near = render(<SnowLayer layer="near" />);
    expect(flakes(back.container)).toHaveLength(62);
    expect(flakes(near.container)).toHaveLength(8);
  });

  it("is decorative: aria-hidden and not part of the accessibility tree", () => {
    mockMedia();
    const { container } = render(<SnowLayer layer="back" />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("uses a few static dots on the back layer and nothing on the near layer with reduced motion", () => {
    mockMedia({ reduced: true });
    const back = render(<SnowLayer layer="back" />);
    const near = render(<SnowLayer layer="near" />);
    expect(flakes(back.container)).toHaveLength(8);
    expect(back.container.firstElementChild).toHaveAttribute("data-still", "true");
    expect(near.container.firstElementChild).toBeNull();
  });

  it("pauses while the tab is hidden and resumes when visible", () => {
    mockMedia();
    const { container } = render(<SnowLayer layer="back" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-paused", "false");

    Object.defineProperty(document, "hidden", { value: true, configurable: true });
    act(() => void document.dispatchEvent(new Event("visibilitychange")));
    expect(root).toHaveAttribute("data-paused", "true");

    Object.defineProperty(document, "hidden", { value: false, configurable: true });
    act(() => void document.dispatchEvent(new Event("visibilitychange")));
    expect(root).toHaveAttribute("data-paused", "false");
  });
});

describe("LanguageSwitcher", () => {
  it("offers DE, IT, EN and ZH with full-name labels and marks the active one", () => {
    render(<LanguageSwitcher locale="it" label="Lingua" onChange={() => {}} />);
    expect(screen.getByRole("group", { name: "Lingua" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Italiano" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Deutsch" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["DE", "IT", "EN", "ZH"]);
  });

  it("reports the chosen locale", async () => {
    const onChange = vi.fn();
    render(<LanguageSwitcher locale="de" label="Sprache" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "中文" }));
    expect(onChange).toHaveBeenCalledWith("zh");
  });
});
