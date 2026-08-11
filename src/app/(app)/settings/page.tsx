import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import SettingsView from "./settings-view";

export const metadata: Metadata = buildPageMetadata({
  title: "Settings",
  description: "Choose your preferred display language for Docy.",
  path: "/settings",
  index: false,
});

export default function Page() {
  return <SettingsView />;
}
