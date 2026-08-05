import type { MetadataRoute } from "next";

import { SITE_NAME, DEFAULT_DESCRIPTION } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "DocuFlow",
    description: DEFAULT_DESCRIPTION,
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#fafafc",
    theme_color: "#5b7fff",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
