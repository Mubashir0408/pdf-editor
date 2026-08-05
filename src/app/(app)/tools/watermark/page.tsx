import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import WatermarkView from "./watermark-view";

export const metadata: Metadata = buildPageMetadata({
  title: "Add Watermark to PDF Online Free",
  description:
    "Brand and protect your PDF documents with a custom text watermark. Free online watermark tool — fast and easy.",
  path: "/tools/watermark",
  keywords: ["watermark pdf", "add watermark to pdf", "pdf branding"],
});

export default function Page() {
  return <WatermarkView />;
}
