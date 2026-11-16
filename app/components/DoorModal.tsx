"use client";

import { useEffect, useRef } from "react";

import { formatDoorDate, type UiCopy } from "@/lib/i18n";
import type { Locale, UnlockedDay } from "@/lib/types";

import { PhotoCredit } from "./PhotoCredit";
import { SupportButtons } from "./SupportButtons";
import styles from "../calendar.module.css";

interface DoorModalProps {
  day: UnlockedDay;
  locale: Locale;
  copy: UiCopy;
  coffeeUrl?: string;
  paypalUrl?: string;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s-6.5-6.1-6.5-11a6.5 6.5 0 0 1 13 0c0 4.9-6.5 11-6.5 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.3" fill="currentColor" />
    </svg>
  );
}

export function DoorModal({
  day,
  locale,
  copy,
  coffeeUrl,
  paypalUrl,
  onClose,
}: DoorModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const content = day.content[locale];
  const date = formatDoorDate(locale, day.day);
  const mapSrc = `https://maps.google.com/maps?q=${day.location.lat},${day.location.lng}&z=12&output=embed`;

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.offsetParent !== null);

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="door-modal-title"
        ref={dialogRef}
      >
        <button
          ref={closeRef}
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label={copy.close}
        >
          <CloseIcon />
        </button>

        <span className={styles.grabber} aria-hidden="true" />
        <div className={styles.modalContent}>
          <figure className={styles.figure}>
            <img
              className={styles.heroImage}
              src={day.imageUrl}
              alt={copy.photoAlt(content.title)}
              decoding="async"
            />
            <span className={styles.figureScrim} aria-hidden="true" />
            <span
              className={styles.windowBadge}
              role="img"
              aria-label={copy.badge(day.day, date)}
            >
              {day.day}
            </span>
          </figure>

          <h2 id="door-modal-title" className={styles.modalTitle}>
            {content.title}
          </h2>
          <p className={styles.modalRegion}>
            {content.region} · {date}
          </p>
          <a
            className={styles.locationLink}
            href={day.location.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <PinIcon />
            <span>{copy.openMaps}</span>
            <span aria-hidden="true">↗</span>
          </a>
          {day.imageCredit ? (
            <PhotoCredit credit={day.imageCredit} label={copy.photoLabel} />
          ) : null}

          <p className={styles.modalDescription}>{content.description}</p>

          <SupportButtons
            copy={copy}
            coffeeUrl={coffeeUrl}
            paypalUrl={paypalUrl}
            variant="modal"
          />
        </div>
      </div>
    </div>
  );
}
