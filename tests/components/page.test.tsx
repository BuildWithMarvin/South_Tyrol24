import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import HomePage from "../../app/page";
import { makeDays } from "./fixtures";

const OPENED_KEY = "suedtirol-opened-doors";
const LANG_KEY = "suedtirol-lang";

function mockFetch(through: number | "error") {
  const fetchMock = vi.fn(async () =>
    through === "error"
      ? new Response("nope", { status: 500 })
      : new Response(JSON.stringify(makeDays(through)), { status: 200 }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  window.matchMedia = vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
  window.history.replaceState({}, "", "/");
});

const door = (n: number) => screen.findByRole("button", { name: new RegExp(`T(ü|u)rchen ${n}[:,]`) });

describe("HomePage", () => {
  it("loads /api/days and renders the 24 windows", async () => {
    const fetchMock = mockFetch(8);
    render(<HomePage />);
    await door(8);
    expect(fetchMock).toHaveBeenCalledWith("/api/days", { cache: "no-store" });
    expect(screen.getAllByRole("button", { name: /Türchen \d+/ })).toHaveLength(24);
    expect(screen.getByRole("heading", { level: 1, name: "Südtirol Adventskalender" })).toBeInTheDocument();
  });

  it("forwards ?preview= to the API, URL-encoded", async () => {
    window.history.replaceState({}, "", "/?preview=a%20b%26c");
    const fetchMock = mockFetch(24);
    render(<HomePage />);
    await door(24);
    expect(fetchMock).toHaveBeenCalledWith("/api/days?preview=a%20b%26c", { cache: "no-store" });
  });

  it("shows the season hint when every door is locked", async () => {
    mockFetch(0);
    render(<HomePage />);
    expect(await screen.findByText(/öffnet am 1\. Dezember/)).toBeInTheDocument();
  });

  it("shows an error with a working retry when the API fails", async () => {
    const fetchMock = mockFetch("error");
    render(<HomePage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Der Kalender konnte nicht geladen werden.");

    fetchMock.mockImplementation(async () => new Response(JSON.stringify(makeDays(3)), { status: 200 }));
    await userEvent.click(screen.getByRole("button", { name: "Erneut versuchen" }));
    await door(3);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("rejects a malformed payload as an error", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("[1,2]", { status: 200 })));
    render(<HomePage />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("opens the modal for an unlocked door and persists it as opened", async () => {
    mockFetch(8);
    render(<HomePage />);
    await userEvent.click(await door(3));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(OPENED_KEY) ?? "[]")).toEqual([3]);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  });

  it("returns focus to the window that opened the modal when it closes", async () => {
    mockFetch(8);
    render(<HomePage />);
    const opener = await door(5);
    await userEvent.click(opener);
    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(await door(5)).toHaveFocus();
  });

  it("shows a hint instead of opening for a locked door", async () => {
    mockFetch(8);
    render(<HomePage />);
    await userEvent.click(await door(9));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(await screen.findByText(/öffnet sich erst am 9\. Dezember/)).toBeInTheDocument();
    expect(window.localStorage.getItem(OPENED_KEY)).toBe("[]");
  });

  it("restores opened doors from localStorage and ignores invalid entries", async () => {
    window.localStorage.setItem(OPENED_KEY, JSON.stringify([2, 2, 99, "x", 0, 4]));
    mockFetch(8);
    render(<HomePage />);
    await door(2);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
    await waitFor(() =>
      expect(JSON.parse(window.localStorage.getItem(OPENED_KEY) ?? "[]")).toEqual([2, 4]),
    );
  });

  it("survives corrupt localStorage", async () => {
    window.localStorage.setItem(OPENED_KEY, "{not json");
    window.localStorage.setItem(LANG_KEY, "fr");
    mockFetch(8);
    render(<HomePage />);
    await door(1);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    expect(document.documentElement.lang).toBe("de");
  });

  it("switches language, relabels the UI, and remembers the choice", async () => {
    mockFetch(8);
    render(<HomePage />);
    await door(1);
    await userEvent.click(screen.getByRole("button", { name: "English" }));

    expect(await screen.findByRole("heading", { level: 1, name: "South Tyrol Advent Calendar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Door 9, still locked/ })).toBeInTheDocument();
    expect(window.localStorage.getItem(LANG_KEY)).toBe("en");
    expect(document.documentElement.lang).toBe("en");
    expect(document.title).toBe("South Tyrol Advent Calendar");
  });

  it("restores the stored language on load", async () => {
    window.localStorage.setItem(LANG_KEY, "it");
    mockFetch(2);
    render(<HomePage />);
    expect(await screen.findByRole("button", { name: /^Porticina 1:/ })).toBeInTheDocument();
  });

  it("shows the footer donate link only when NEXT_PUBLIC_BUYMEACOFFEE_URL is set", async () => {
    mockFetch(2);
    const first = render(<HomePage />);
    await door(1);
    expect(screen.queryByRole("link", { name: /Buy Me a Coffee/ })).toBeNull();
    first.unmount();

    vi.stubEnv("NEXT_PUBLIC_BUYMEACOFFEE_URL", " https://buymeacoffee.com/example ");
    render(<HomePage />);
    await door(1);
    expect(screen.getByRole("link", { name: /Buy Me a Coffee/ })).toHaveAttribute(
      "href",
      "https://buymeacoffee.com/example",
    );
  });

  it("offers the donate button inside the modal too when configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_BUYMEACOFFEE_URL", "https://buymeacoffee.com/example");
    mockFetch(2);
    render(<HomePage />);
    await userEvent.click(await door(1));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("link", { name: /Buy Me a Coffee/ })).toBeInTheDocument();
  });

  it("renders each support button independently and both side by side", async () => {
    vi.stubEnv("NEXT_PUBLIC_PAYPAL_URL", "https://paypal.me/example");
    mockFetch(2);
    const only = render(<HomePage />);
    await door(1);
    expect(screen.getByRole("link", { name: /PayPal/ })).toHaveAttribute(
      "href",
      "https://paypal.me/example",
    );
    expect(screen.queryByRole("link", { name: /Buy Me a Coffee/ })).toBeNull();
    only.unmount();

    vi.stubEnv("NEXT_PUBLIC_BUYMEACOFFEE_URL", "https://buymeacoffee.com/example");
    render(<HomePage />);
    await userEvent.click(await door(1));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("link", { name: /Buy Me a Coffee/ })).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /PayPal/ })).toBeInTheDocument();
  });
});
