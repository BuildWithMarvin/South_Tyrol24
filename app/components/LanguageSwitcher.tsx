import { LOCALES, LOCALE_LABELS } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

import styles from "../calendar.module.css";

const NAMES: Record<Locale, string> = {
  de: "Deutsch",
  it: "Italiano",
  en: "English",
  zh: "中文",
};

interface LanguageSwitcherProps {
  locale: Locale;
  label: string;
  onChange: (locale: Locale) => void;
}

export function LanguageSwitcher({
  locale,
  label,
  onChange,
}: LanguageSwitcherProps) {
  return (
    <div className={styles.switcher} role="group" aria-label={label}>
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          className={`${styles.langButton} ${
            code === locale ? styles.langActive : ""
          }`}
          aria-pressed={code === locale}
          aria-label={NAMES[code]}
          lang={code}
          onClick={() => onChange(code)}
        >
          {LOCALE_LABELS[code]}
        </button>
      ))}
    </div>
  );
}
