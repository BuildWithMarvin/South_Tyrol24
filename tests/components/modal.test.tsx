import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DoorModal } from "../../app/components/DoorModal";
import { PhotoCredit } from "../../app/components/PhotoCredit";
import { UI } from "../../lib/i18n";
import { unlocked } from "./fixtures";

const day = unlocked(1);

function setup(props: { coffeeUrl?: string; locale?: "de" | "en" | "zh" } = {}) {
  const onClose = vi.fn();
  const locale = props.locale ?? "de";
  render(
    <DoorModal
      day={day}
      locale={locale}
      copy={UI[locale]}
      coffeeUrl={props.coffeeUrl}
      onClose={onClose}
    />,
  );
  return { onClose };
}

describe("DoorModal", () => {
  it("is a labelled modal dialog with the localized title, photo and text", () => {
    setup();
    const dialog = screen.getByRole("dialog", { name: day.content.de.title });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("img", { name: UI.de.photoAlt(day.content.de.title) })).toHaveAttribute(
      "src",
      day.imageUrl,
    );
    expect(screen.getByText(day.content.de.description)).toBeInTheDocument();
  });

  it("renders the content in the active locale", () => {
    setup({ locale: "zh" });
    expect(screen.getByRole("dialog", { name: day.content.zh.title })).toBeInTheDocument();
    expect(screen.getByText(day.content.zh.description)).toBeInTheDocument();
  });

  it("shows the photo credit and no embedded map", () => {
    setup();
    expect(screen.getByText(new RegExp(day.imageCredit?.author ?? "x"))).toBeInTheDocument();
    expect(document.querySelector("iframe")).toBeNull();
  });

  it("links to the location on Google Maps once, right after the title", () => {
    setup();
    const links = screen.getAllByRole("link", { name: new RegExp(UI.de.openMaps) });
    expect(links).toHaveLength(1);
    const link = links[0];
    expect(link).toHaveAttribute("href", day.location.mapsUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");

    const title = screen.getByRole("heading", { level: 2 });
    expect(title.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      link.compareDocumentPosition(screen.getByText(day.content.de.description)) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("localizes the Maps link", () => {
    setup({ locale: "en" });
    expect(screen.getAllByRole("link", { name: /Open in Google Maps/ })).toHaveLength(1);
  });

  it("shows the Buy Me a Coffee link only when a URL is configured", () => {
    const { unmount } = render(
      <DoorModal day={day} locale="de" copy={UI.de} onClose={() => {}} />,
    );
    expect(screen.queryByRole("link", { name: /Buy Me a Coffee/ })).toBeNull();
    unmount();

    setup({ coffeeUrl: "https://buymeacoffee.com/example" });
    const donate = screen.getByRole("link", { name: /Buy Me a Coffee/ });
    expect(donate).toHaveAttribute("href", "https://buymeacoffee.com/example");
    expect(donate.getAttribute("rel")).toContain("noopener");
  });

  it("closes on Escape, on the close button and on a backdrop click", async () => {
    const { onClose } = setup();
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("button", { name: UI.de.close }));
    expect(onClose).toHaveBeenCalledTimes(2);

    const backdrop = screen.getByRole("dialog").parentElement as HTMLElement;
    await userEvent.pointer({ keys: "[MouseLeft]", target: backdrop });
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("does not close when the click lands inside the sheet", async () => {
    const { onClose } = setup();
    await userEvent.click(screen.getByText(day.content.de.description));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("moves focus to the close button, and locks body scroll while open", () => {
    setup();
    expect(screen.getByRole("button", { name: UI.de.close })).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("traps Tab focus inside the dialog in both directions", async () => {
    // jsdom has no layout: report every element as rendered so the trap's
    // visibility filter keeps them.
    vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.parentElement;
    });
    setup({ coffeeUrl: "https://buymeacoffee.com/example" });
    const dialog = screen.getByRole("dialog");
    const close = screen.getByRole("button", { name: UI.de.close });
    const donate = screen.getByRole("link", { name: /Buy Me a Coffee/ });

    donate.focus();
    await userEvent.tab();
    expect(close).toHaveFocus();

    await userEvent.tab({ shift: true });
    expect(donate).toHaveFocus();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it("returns focus to the opener and restores scrolling when closed", () => {
    const opener = document.createElement("button");
    document.body.append(opener);
    opener.focus();

    const view = render(
      <DoorModal day={day} locale="de" copy={UI.de} onClose={() => {}} />,
    );
    expect(opener).not.toHaveFocus();
    view.unmount();

    expect(opener).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
    opener.remove();
  });
});

describe("PhotoCredit", () => {
  it("links author and licence when URLs are present", () => {
    render(
      <PhotoCredit
        label="Foto"
        credit={{
          author: "A. Author",
          source: "Unsplash",
          sourceUrl: "https://example.com/a",
          license: "Unsplash License",
          licenseUrl: "https://example.com/l",
        }}
      />,
    );
    expect(screen.getByRole("link", { name: "A. Author" })).toHaveAttribute(
      "href",
      "https://example.com/a",
    );
    expect(screen.getByRole("link", { name: "Unsplash License" })).toHaveAttribute(
      "href",
      "https://example.com/l",
    );
    expect(screen.getByText(/Foto:/)).toBeInTheDocument();
  });

  it("falls back to plain text without URLs or licence", () => {
    render(<PhotoCredit label="Foto" credit={{ author: "B. Author", source: "Pixabay" }} />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText(/B\. Author/)).toBeInTheDocument();
    expect(screen.getByText(/Pixabay/)).toBeInTheDocument();
  });
});
