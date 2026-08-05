import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import ProtectView from "./protect-view";

export const metadata: Metadata = buildPageMetadata({
  title: "Password Protect PDF Online Free",
  description:
    "Encrypt sensitive PDF documents with a password before sharing. Free online PDF password protection — secure and private.",
  path: "/tools/protect",
  keywords: ["password protect pdf", "encrypt pdf", "secure pdf", "pdf password online"],
});

export default function Page() {
  return <ProtectView />;
}
