import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import PdfToWordView from "./pdf-to-word-view";

export const metadata: Metadata = buildPageMetadata({
  title: "PDF to Word Converter Online Free",
  description: "Turn a PDF's text into an editable Word document. Free online PDF to Word converter.",
  path: "/tools/pdf-to-word",
  keywords: ["pdf to word", "pdf to docx", "convert pdf to word online"],
});

export default function Page() {
  return <PdfToWordView />;
}
