import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Südtirol Adventskalender",
    short_name: "Südtirol 24",
    description:
      "24 Türchen, 24 Orte in Südtirol – ein Advent voller Dolomiten, Bergdörfer und Winterlicht.",
    start_url: "/",
    display: "standalone",
    background_color: "#151830",
    theme_color: "#151830",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
