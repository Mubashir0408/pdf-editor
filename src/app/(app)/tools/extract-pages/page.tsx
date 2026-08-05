import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import ExtractPagesView from "./extract-pages-view";

export const metadata: Metadata = buildPageMetadata({
  title: "Extract Pages from PDF Online Free",
  description:
    "Pull specific pages out of a PDF document into a new file. Free online page extraction tool.",
  path: "/tools/extract-pages",
  keywords: ["extract pdf pages", "pull pages from pdf", "pdf page extractor"],
});

export default function Page() {
  return <ExtractPagesView />;
}
