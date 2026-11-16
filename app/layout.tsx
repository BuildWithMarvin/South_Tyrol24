import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Südtirol Adventskalender",
  description:
    "24 Türchen, 24 Orte in Südtirol – ein Advent voller Dolomiten, Bergdörfer und Winterlicht.",
  applicationName: "Südtirol Adventskalender",
};

export const viewport: Viewport = {
  themeColor: "#151830",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="de"
      className={`${sans.variable} ${display.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
