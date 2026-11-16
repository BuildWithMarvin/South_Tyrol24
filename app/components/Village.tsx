import { type UiCopy, formatDoorDate } from "@/lib/i18n";
import type { Locale, PublicDay } from "@/lib/types";

import styles from "../calendar.module.css";
import {
  ADVENT_DAYS,
  getTodayDoor,
  HOUSES,
  HOUSE_BODIES,
  HOUSE_OFFSETS,
} from "@/lib/village";
import { Star4 } from "./Emblems";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m5.5 12.5 4.2 4.2 8.8-9.4"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface VillageProps {
  /** `null` while loading: renders inert placeholder windows. */
  days: PublicDay[] | null;
  locale: Locale;
  copy: UiCopy;
  openedSet: ReadonlySet<number>;
  onSelect: (day: number) => void;
}

export function Village({
  days,
  locale,
  copy,
  openedSet,
  onSelect,
}: VillageProps) {
  const byDay = new Map<number, PublicDay>();
  for (const entry of days ?? []) {
    byDay.set(entry.day, entry);
  }
  const today = getTodayDoor(days ?? []);

  return (
    <div className={styles.village} aria-hidden={days ? undefined : true}>
      {HOUSES.map((house, index) => (
        <div
          key={house.join("-")}
          className={styles.house}
          style={{ marginTop: HOUSE_OFFSETS[index] }}
        >
          <div className={styles.roof} />
          <div className={styles.houseBody} style={{ background: HOUSE_BODIES[index] }}>
            {house.map((dayNumber) => {
              const day = byDay.get(dayNumber);
              if (!day) {
                return (
                  <span
                    key={dayNumber}
                    className={`${styles.win} ${styles.locked} ${styles.placeholder}`}
                  />
                );
              }

              const isLocked = day.isLocked;
              const isOpened = !isLocked && openedSet.has(dayNumber);
              const isToday = !isLocked && !isOpened && dayNumber === today;
              const title = isLocked ? null : day.content[locale].title;
              const date = formatDoorDate(locale, dayNumber);
              const label = isLocked
                ? copy.doorAriaLocked(dayNumber, date)
                : isOpened && title
                  ? copy.doorAriaOpened(dayNumber, title)
                  : copy.doorAriaOpen(dayNumber, title ?? "");

              const state = isLocked
                ? styles.locked
                : isOpened
                  ? styles.open
                  : styles.ready;
              const photo = !isLocked && isOpened ? day.imageUrl : null;

              return (
                <button
                  key={dayNumber}
                  type="button"
                  className={`${styles.win} ${state} ${isToday ? styles.today : ""}`}
                  aria-label={label}
                  aria-disabled={isLocked || undefined}
                  onClick={() => onSelect(dayNumber)}
                >
                  {photo ? (
                    <>
                      <img
                        className={styles.winPhoto}
                        src={photo}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className={styles.winTint} aria-hidden="true" />
                    </>
                  ) : null}
                  {ADVENT_DAYS.has(dayNumber) ? (
                    <span className={styles.flame} aria-hidden="true" />
                  ) : null}
                  {dayNumber === 24 ? (
                    <Star4 className={styles.star} width={12} height={12} />
                  ) : null}
                  <span className={styles.winNumber}>{dayNumber}</span>
                  {photo ? (
                    <span className={styles.winCheck} aria-hidden="true">
                      <CheckIcon />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
