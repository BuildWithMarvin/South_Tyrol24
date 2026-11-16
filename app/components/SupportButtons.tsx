import type { UiCopy } from "@/lib/i18n";
import styles from "../calendar.module.css";

interface Props {
  copy: Pick<UiCopy, "donate" | "paypal">;
  coffeeUrl?: string;
  paypalUrl?: string;
  variant: "footer" | "modal";
}

export function SupportButtons({ copy, coffeeUrl, paypalUrl, variant }: Props) {
  if (!coffeeUrl && !paypalUrl) return null;
  const base = variant === "footer" ? styles.donateButton : styles.modalDonate;
  return (
    <div className={variant === "footer" ? styles.supportGroup : styles.modalActions}>
      {coffeeUrl ? (
        <a className={base} href={coffeeUrl} target="_blank" rel="noopener noreferrer">
          {copy.donate}
        </a>
      ) : null}
      {paypalUrl ? (
        <a
          className={`${base} ${styles.paypalButton}`}
          href={paypalUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {copy.paypal}
        </a>
      ) : null}
    </div>
  );
}
