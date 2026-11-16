import type { ImageCredit } from "@/lib/types";

import styles from "../calendar.module.css";

interface PhotoCreditProps {
  credit: ImageCredit;
  label: string;
}

export function PhotoCredit({ credit, label }: PhotoCreditProps) {
  return (
    <p className={styles.photoCredit}>
      {label}:{" "}
      {credit.sourceUrl ? (
        <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer">
          {credit.author}
        </a>
      ) : (
        <span>{credit.author}</span>
      )}
      {" · "}
      <span>{credit.source}</span>
      {credit.license ? (
        <>
          {" ("}
          {credit.licenseUrl ? (
            <a
              href={credit.licenseUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {credit.license}
            </a>
          ) : (
            credit.license
          )}
          {")"}
        </>
      ) : null}
    </p>
  );
}
