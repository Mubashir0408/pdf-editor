import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import OcrView from "./ocr-view";

export const metadata: Metadata = buildPageMetadata({
  title: "OCR PDF Scanner — Extract Text Online",
  description:
    "Extract editable, searchable text from scanned images and PDF documents using OCR. Free online text recognition tool.",
  path: "/ocr",
  keywords: ["ocr pdf", "extract text from pdf", "pdf text recognition", "scanned pdf to text"],
});

export default function Page() {
  return <OcrView />;
}
