"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AlpineScene } from "./components/AlpineScene";
import { DoorModal } from "./components/DoorModal";
import { Star4 } from "./components/Emblems";
import { InstallPrompt } from "./components/InstallPrompt";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { SnowLayer } from "./components/SnowLayer";
import { SupportButtons } from "./components/SupportButtons";
import { Village } from "./components/Village";
import { formatDoorDate, isLocale, UI } from "@/lib/i18n";
import type { Locale, PublicDay, UnlockedDay } from "@/lib/types";
import styles from "./calendar.module.css";

const LANG_KEY = "suedtirol-lang";
const OPENED_KEY = "suedtirol-opened-doors";
const TOTAL_DOORS = 24;

function readStoredLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(LANG_KEY);
    return isLocale(stored) ? stored : "de";
  } catch {
    return "de";
  }
}

function readStoredOpened(): number[] {
  try {
    const raw = window.localStorage.getItem(OPENED_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const days = parsed.filter(
      (value): value is number =>
        typeof value === "number" &&
        Number.isInteger(value) &&
        value >= 1 &&
        value <= TOTAL_DOORS,
    );

    return [...new Set(days)].sort((a, b) => a - b);
  } catch {
    return [];
  }
}

export default function HomePage() {
  const [days, setDays] = useState<PublicDay[] | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [locale, setLocale] = useState<Locale>("de");
  const [opened, setOpened] = useState<number[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);

  const copy = UI[locale];
  const openedSet = useMemo(() => new Set(opened), [opened]);

  useEffect(() => {
    setLocale(readStoredLocale());
    setOpened(readStoredOpened());
    setStorageReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = UI[locale].title;

    if (!storageReady) {
      return;
    }

    try {
      window.localStorage.setItem(LANG_KEY, locale);
    } catch {
      // Private mode or blocked storage: keep the in-memory preference.
    }
  }, [locale, storageReady]);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    try {
      window.localStorage.setItem(OPENED_KEY, JSON.stringify(opened));
    } catch {
      // Progress stays in memory if storage is unavailable.
    }
  }, [opened, storageReady]);

  const loadDays = useCallback(async () => {
    setStatus("loading");

    try {
      const preview = new URLSearchParams(window.location.search).get(
        "preview",
      );
      const url = preview
        ? `/api/days?preview=${encodeURIComponent(preview)}`
        : "/api/days";

      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload: unknown = await response.json();
      if (!Array.isArray(payload) || payload.length !== TOTAL_DOORS) {
        throw new Error("Unexpected calendar payload");
      }

      const sorted = [...(payload as PublicDay[])].sort(
        (a, b) => a.day - b.day,
      );

      setDays(sorted);
      setStatus("ready");
    } catch {
      setDays(null);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void loadDays();
  }, [loadDays]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleSelectDoor = useCallback(
    (dayNumber: number) => {
      if (!days) {
        return;
      }

      const day = days.find((entry) => entry.day === dayNumber);
      if (!day) {
        return;
      }

      if (day.isLocked) {
        setToast({
          id: Date.now(),
          text: copy.lockedHint(formatDoorDate(locale, dayNumber)),
        });
        return;
      }

      setOpened((current) =>
        current.includes(dayNumber)
          ? current
          : [...current, dayNumber].sort((a, b) => a - b),
      );
      setActiveDay(dayNumber);
    },
    [copy, days, locale],
  );

  const activeDayData = useMemo<UnlockedDay | null>(() => {
    if (!days || activeDay === null) {
      return null;
    }

    const found = days.find((entry) => entry.day === activeDay);
    return found && !found.isLocked ? found : null;
  }, [activeDay, days]);

  const closeModal = useCallback(() => setActiveDay(null), []);

  const openedCount = useMemo(
    () =>
      days
        ? days.filter((entry) => !entry.isLocked && openedSet.has(entry.day))
            .length
        : 0,
    [days, openedSet],
  );

  const allLocked = useMemo(
    () => (days ? days.every((entry) => entry.isLocked) : false),
    [days],
  );

  const coffeeUrl = process.env.NEXT_PUBLIC_BUYMEACOFFEE_URL?.trim();
  const paypalUrl = process.env.NEXT_PUBLIC_PAYPAL_URL?.trim();

  return (
    <div className={styles.page}>
      <SnowLayer layer="near" />
      <div className={styles.stage}>
        <AlpineScene />
        <SnowLayer layer="back" />
        <div className={styles.content}>
          <div className={styles.inner}>
            <div className={styles.top}>
              <div className={styles.topbar}>
                <div
                  className={styles.progressPill}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={TOTAL_DOORS}
                  aria-valuenow={openedCount}
                  aria-label={copy.progress(openedCount, TOTAL_DOORS)}
                >
                  <span className={styles.progressCount} aria-hidden="true">
                    {openedCount}{" "}
                    <span className={styles.progressDivider}>/</span>{" "}
                    {TOTAL_DOORS}
                  </span>
                  <span className={styles.progressTrack} aria-hidden="true">
                    <span
                      className={styles.progressFill}
                      style={{
                        width: `${(openedCount / TOTAL_DOORS) * 100}%`,
                      }}
                    />
                  </span>
                </div>
                <LanguageSwitcher
                  locale={locale}
                  label={copy.languageLabel}
                  onChange={setLocale}
                />
              </div>

              <header className={styles.hero}>
                <Star4 className={styles.emblem} aria-hidden="true" />
                <h1 className={styles.title}>{copy.title}</h1>
                <p className={styles.subtitle}>{copy.subtitle}</p>
                {status === "ready" && allLocked ? (
                  <p className={styles.seasonHint}>{copy.seasonHint}</p>
                ) : null}
              </header>
            </div>

            <main className={styles.main}>
              {status === "loading" ? (
                <p className={styles.stateText} aria-live="polite">
                  {copy.loading}
                </p>
              ) : null}

              {status === "error" ? (
                <section className={styles.statePanel} role="alert">
                  <h2 className={styles.stateTitle}>{copy.errorTitle}</h2>
                  <p className={styles.stateText}>{copy.errorBody}</p>
                  <button
                    type="button"
                    className={styles.retryButton}
                    onClick={() => void loadDays()}
                  >
                    {copy.retry}
                  </button>
                </section>
              ) : (
                <Village
                  days={status === "ready" ? days : null}
                  locale={locale}
                  copy={copy}
                  openedSet={openedSet}
                  onSelect={handleSelectDoor}
                />
              )}
            </main>

            <footer className={styles.footer}>
              <p className={styles.footerText}>{copy.footer}</p>
              <SupportButtons
                copy={copy}
                coffeeUrl={coffeeUrl}
                paypalUrl={paypalUrl}
                variant="footer"
              />
              <InstallPrompt copy={copy} />
            </footer>
          </div>
        </div>
      </div>

      {activeDayData ? (
        <DoorModal
          day={activeDayData}
          locale={locale}
          copy={copy}
          coffeeUrl={coffeeUrl}
          paypalUrl={paypalUrl}
          onClose={closeModal}
        />
      ) : null}

      <div className={styles.toastRegion} aria-live="polite" aria-atomic="true">
        {toast ? (
          <p key={toast.id} className={styles.toast}>
            {toast.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}
