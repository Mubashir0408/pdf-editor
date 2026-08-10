import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import SignupView from "./signup-view";

export const metadata: Metadata = buildPageMetadata({
  title: "Sign Up",
  description: "Create a free DocuFlow AI account for unlimited access to every PDF tool.",
  path: "/signup",
  index: false,
});

export default function Page() {
  return <SignupView />;
}
