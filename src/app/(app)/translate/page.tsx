import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import TranslateView from "./translate-view";

export const metadata: Metadata = buildPageMetadata({
  title: "Translate PDF Online Free",
  description:
    "Translate PDF documents into 12 languages while preserving paragraphs and formatting. Free online PDF translator with OCR support for scanned documents.",
  path: "/translate",
  keywords: ["translate pdf", "pdf translator online", "translate document", "multilingual pdf"],
});

export default function Page() {
  return <TranslateView />;
}
