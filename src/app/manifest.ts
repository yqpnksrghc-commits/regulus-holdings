import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// PWA / installability manifest. Icons reference the SVG favicon (scales to any
// size) and the generated apple-icon. Colors match the design tokens.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0b0c0f",
    theme_color: "#0b0c0f",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  };
}
