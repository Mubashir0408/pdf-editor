import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import RotateView from "./rotate-view";

export const metadata: Metadata = buildPageMetadata({
  title: "Rotate PDF Pages Online Free",
  description: "Fix sideways or upside-down PDF pages in seconds. Free online PDF rotation tool.",
  path: "/tools/rotate",
  keywords: ["rotate pdf", "fix pdf orientation", "turn pdf pages"],
});

export default function Page() {
  return <RotateView />;
}
