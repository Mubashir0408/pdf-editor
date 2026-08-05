import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/** Every real, indexable route in the app — kept as an explicit list
 *  (rather than derived from the filesystem) since a couple of routes
 *  (`/settings`) are deliberately excluded via robots.ts and shouldn't
 *  appear here either. */
const ROUTES: { path: string; priority: number }[] = [
  { path: "/dashboard", priority: 1 },
  { path: "/convert", priority: 0.9 },
  { path: "/merge", priority: 0.9 },
  { path: "/split", priority: 0.9 },
  { path: "/compress", priority: 0.9 },
  { path: "/ocr", priority: 0.8 },
  { path: "/translate", priority: 0.8 },
  { path: "/chat", priority: 0.7 },
  { path: "/tools/protect", priority: 0.8 },
  { path: "/tools/watermark", priority: 0.8 },
  { path: "/tools/rotate", priority: 0.8 },
  { path: "/tools/extract-pages", priority: 0.8 },
  { path: "/tools/delete-pages", priority: 0.8 },
  { path: "/tools/word-to-pdf", priority: 0.8 },
  { path: "/tools/excel-to-pdf", priority: 0.8 },
  { path: "/tools/powerpoint-to-pdf", priority: 0.8 },
  { path: "/tools/image-to-pdf", priority: 0.8 },
  { path: "/tools/pdf-to-image", priority: 0.8 },
  { path: "/tools/pdf-to-word", priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority,
  }));
}
