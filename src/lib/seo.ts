import type { Metadata } from "next";

export const SITE_NAME = "Docy";

/** Falls back to localhost for local dev — set NEXT_PUBLIC_SITE_URL to the
 *  real deployed origin in production so canonical/OG/sitemap URLs are
 *  correct (see .env.example). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const DEFAULT_DESCRIPTION =
  "Convert, merge, split, compress, and edit PDFs online for free. Fast, private, and secure — no account required.";

export const DEFAULT_KEYWORDS = [
  "pdf tools",
  "online pdf editor",
  "free pdf converter",
  "merge pdf",
  "split pdf",
  "compress pdf",
];

interface BuildPageMetadataParams {
  /** Plain page title — the root layout's title template appends "· Docy" automatically. */
  title: string;
  description: string;
  /** Route path starting with "/", e.g. "/merge" — used to build the canonical URL. */
  path: string;
  keywords?: string[];
  /** Set false for utility pages (e.g. Settings) that have no unique public/search value. */
  index?: boolean;
}

/**
 * Every tool page is a client component (interactive upload/progress/result
 * UI), and Next.js only allows a `metadata` export from a module that isn't
 * `"use client"` — so each route's `page.tsx` is a thin server component
 * that calls this to build its metadata and renders the real client
 * component. This is what makes per-page title/description/OG/canonical
 * possible without turning any tool's actual UI into a server component.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  index = true,
}: BuildPageMetadataParams): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    keywords: keywords ?? DEFAULT_KEYWORDS,
    alternates: { canonical: url },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
