import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Village } from "../../app/components/Village";
import { UI } from "../../lib/i18n";
import { makeDays } from "./fixtures";

function setup(through: number, opened: number[] = [], days = makeDays(through)) {
  const onSelect = vi.fn();
  const view = render(
    <Village
      days={days}
      locale="de"
      copy={UI.de}
      openedSet={new Set(opened)}
      onSelect={onSelect}
    />,
  );
  return { onSelect, ...view };
}

const doors = () => screen.getAllByRole("button");

describe("Village", () => {
  it("renders 24 window buttons in the shuffled house order", () => {
    setup(24);
    const numbers = doors().map((b) => b.textContent?.trim());
    expect(numbers).toHaveLength(24);
    expect(numbers.slice(0, 6)).toEqual(["7", "19", "3", "14", "1", "22"]);
  });

  it("locks doors after today with an aria-disabled, localized label", () => {
    setup(8);
    const locked = screen.getByRole("button", { name: /Türchen 9,/ });
    expect(locked).toHaveAttribute("aria-disabled", "true");
    expect(locked.getAttribute("aria-label")).toContain("noch verschlossen");
    expect(screen.getByRole("button", { name: /Türchen 8:/ })).not.toHaveAttribute(
      "aria-disabled",
    );
  });

  it("still reports clicks on locked doors so the page can show its hint", async () => {
    const { onSelect } = setup(8);
    await userEvent.click(screen.getByRole("button", { name: /Türchen 9,/ }));
    expect(onSelect).toHaveBeenCalledWith(9);
  });

  it("calls onSelect with the day for unlocked doors, by mouse and keyboard", async () => {
    const { onSelect } = setup(8);
    await userEvent.click(screen.getByRole("button", { name: /Türchen 3:/ }));
    expect(onSelect).toHaveBeenLastCalledWith(3);

    screen.getByRole("button", { name: /Türchen 5:/ }).focus();
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenLastCalledWith(5);
  });

  it("pulses only the highest unlocked door, and only while unopened", () => {
    const { container, rerender } = setup(8);
    expect(container.querySelectorAll(".today")).toHaveLength(1);
    expect(screen.getByRole("button", { name: /Türchen 8:/ })).toHaveClass("today");

    rerender(
      <Village
        days={makeDays(8)}
        locale="de"
        copy={UI.de}
        openedSet={new Set([8])}
        onSelect={() => {}}
      />,
    );
    expect(container.querySelectorAll(".today")).toHaveLength(0);
  });

  it("shows the photo and an 'opened' label for opened doors", () => {
    const { container } = setup(8, [1, 2]);
    expect(container.querySelectorAll("img")).toHaveLength(2);
    const opened = screen.getByRole("button", { name: /Türchen 1:.*Geöffnet/ });
    expect(opened).toHaveClass("open");
    expect(opened.querySelector("img")).toHaveAttribute(
      "src",
      expect.stringContaining("/images/"),
    );
  });

  it("marks only the Advent Sundays with a flame and day 24 with a star", () => {
    const { container } = setup(24);
    expect(container.querySelectorAll(".flame")).toHaveLength(3);
    for (const day of [6, 13, 20]) {
      const win = screen.getByRole("button", { name: new RegExp(`Türchen ${day}:`) });
      expect(win.querySelector(".flame")).not.toBeNull();
    }
    const finale = screen.getByRole("button", { name: /Türchen 24:/ });
    expect(finale.querySelector(".star")).not.toBeNull();
    expect(container.querySelectorAll(".star")).toHaveLength(1);
  });

  it("renders inert, hidden placeholders while loading", () => {
    const { container } = render(
      <Village
        days={null}
        locale="de"
        copy={UI.de}
        openedSet={new Set()}
        onSelect={() => {}}
      />,
    );
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll(".placeholder")).toHaveLength(24);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("localizes the labels", () => {
    render(
      <Village
        days={makeDays(2)}
        locale="en"
        copy={UI.en}
        openedSet={new Set()}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: /^Door 3, still locked/ })).toBeInTheDocument();
  });
});
