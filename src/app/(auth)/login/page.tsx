import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import LoginView from "./login-view";

export const metadata: Metadata = buildPageMetadata({
  title: "Log In",
  description: "Sign in to Docy for unlimited access to every PDF tool.",
  path: "/login",
  index: false,
});

export default function Page() {
  return <LoginView />;
}
