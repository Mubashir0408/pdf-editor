import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import ImageToPdfView from "./image-to-pdf-view";

export const metadata: Metadata = buildPageMetadata({
  title: "Image to PDF Converter Online Free",
  description:
    "Combine JPG or PNG images into a single PDF document. Free online image to PDF converter.",
  path: "/tools/image-to-pdf",
  keywords: ["image to pdf", "jpg to pdf", "png to pdf", "convert photos to pdf"],
});

export default function Page() {
  return <ImageToPdfView />;
}
