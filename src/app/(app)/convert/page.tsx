import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import ConvertView from "./convert-view";

export const metadata: Metadata = buildPageMetadata({
  title: "Convert PDF Files Online Free",
  description:
    "Convert documents between PDF, Word, Excel, PowerPoint, and image formats. Free, fast online file converter.",
  path: "/convert",
  keywords: ["convert pdf", "pdf converter online", "file format converter"],
});

export default function Page() {
  return <ConvertView />;
}
