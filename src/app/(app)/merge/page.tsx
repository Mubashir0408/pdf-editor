import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import MergeView from "./merge-view";

export const metadata: Metadata = buildPageMetadata({
  title: "Merge PDF Files Online Free",
  description:
    "Combine multiple PDF documents into one organized file in seconds. Drag, reorder, and merge PDFs online — free, fast, and no sign-up required.",
  path: "/merge",
  keywords: ["merge pdf", "combine pdf files", "join pdf online", "pdf merger"],
});

export default function Page() {
  return <MergeView />;
}
