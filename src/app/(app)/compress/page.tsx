import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import CompressView from "./compress-view";

export const metadata: Metadata = buildPageMetadata({
  title: "Compress PDF Online Free",
  description:
    "Shrink PDF file size while keeping documents sharp and readable. Free online PDF compressor — fast, secure, no sign-up.",
  path: "/compress",
  keywords: ["compress pdf", "reduce pdf size", "shrink pdf", "pdf compressor online"],
});

export default function Page() {
  return <CompressView />;
}
