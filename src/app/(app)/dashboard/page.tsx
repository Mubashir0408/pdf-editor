import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import DashboardView from "./dashboard-view";

export const metadata: Metadata = buildPageMetadata({
  title: "Free Online PDF Tools",
  description:
    "Your PDF workspace — merge, split, compress, convert, translate, and chat with your documents. Every tool in one place, free and no sign-up required.",
  path: "/dashboard",
  keywords: ["pdf tools", "online pdf editor", "free pdf tools", "pdf workspace"],
});

export default function Page() {
  return <DashboardView />;
}
