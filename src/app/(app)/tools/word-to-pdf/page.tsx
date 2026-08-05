import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import WordToPdfView from "./word-to-pdf-view";

export const metadata: Metadata = buildPageMetadata({
  title: "Word to PDF Converter Online Free",
  description:
    "Convert Word documents (.docx) into polished, shareable PDFs. Free online Word to PDF converter.",
  path: "/tools/word-to-pdf",
  keywords: ["word to pdf", "docx to pdf", "convert word to pdf online"],
});

export default function Page() {
  return <WordToPdfView />;
}
