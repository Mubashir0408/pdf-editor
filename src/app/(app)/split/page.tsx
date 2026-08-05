import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import SplitView from "./split-view";

export const metadata: Metadata = buildPageMetadata({
  title: "Split PDF Online Free",
  description:
    "Break a PDF apart by page range or extract every page individually. Split PDF files online instantly — free, private, no account needed.",
  path: "/split",
  keywords: ["split pdf", "divide pdf", "extract pdf pages", "pdf splitter"],
});

export default function Page() {
  return <SplitView />;
}
