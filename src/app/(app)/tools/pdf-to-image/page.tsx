import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import PdfToImageView from "./pdf-to-image-view";

export const metadata: Metadata = buildPageMetadata({
  title: "PDF to Image Converter Online Free",
  description: "Export every page of a PDF as a PNG or JPG image. Free online PDF to image converter.",
  path: "/tools/pdf-to-image",
  keywords: ["pdf to image", "pdf to jpg", "pdf to png", "convert pdf to picture"],
});

export default function Page() {
  return <PdfToImageView />;
}
