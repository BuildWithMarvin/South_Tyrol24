"use client";

import { useEffect, useState } from "react";

import type { UiCopy } from "@/lib/i18n";

import styles from "../calendar.module.css";

const DISMISSED_KEY = "suedtirol-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Mode = "ios" | "native" | null;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function wasDismissed() {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

function ShareIcon() {
  return (
    <svg
      className={styles.installShareIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 15V3M8 7l4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
    </svg>
  );
}

export function InstallPrompt({ copy }: { copy: UiCopy }) {
  const [mode, setMode] = useState<Mode>(null);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (wasDismissed() || isStandalone()) {
      return;
    }
    if (!window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      return;
    }

    setDismissed(false);
    if (isIos()) {
      setMode("ios");
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setMode("native");
    };
    const onInstalled = () => {
      setMode(null);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (dismissed || mode === null) {
    return null;
  }

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Dismissal then only lasts for this visit.
    }
    setDismissed(true);
  };

  const install = async () => {
    if (!deferred) {
      return;
    }
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setMode(null);
  };

  const [shareBefore, shareAfter = ""] = copy.installIosShare.split("{icon}");

  return (
    <section className={styles.installCard} aria-labelledby="install-title">
      <h2 id="install-title" className={styles.installTitle}>
        {copy.installTitle}
      </h2>

      {mode === "native" ? (
        <>
          <p className={styles.installText}>{copy.installAndroidBody}</p>
          <button type="button" className={styles.installButton} onClick={install}>
            {copy.installButton}
          </button>
        </>
      ) : (
        <ol className={styles.installSteps}>
          <li>
            {shareBefore}
            <ShareIcon />
            {shareAfter}
          </li>
          <li>{copy.installIosAdd}</li>
        </ol>
      )}

      <button type="button" className={styles.installClose} onClick={dismiss}>
        {copy.installClose}
      </button>
    </section>
  );
}
