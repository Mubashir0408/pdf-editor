import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import PowerpointToPdfView from "./powerpoint-to-pdf-view";

export const metadata: Metadata = buildPageMetadata({
  title: "PowerPoint to PDF Converter Online Free",
  description:
    "Convert PowerPoint presentations (.pptx) into shareable, print-ready PDFs. Free online PPT to PDF converter.",
  path: "/tools/powerpoint-to-pdf",
  keywords: ["powerpoint to pdf", "ppt to pdf", "convert presentation to pdf"],
});

export default function Page() {
  return <PowerpointToPdfView />;
}
