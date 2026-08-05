import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import ChatView from "./chat-view";

export const metadata: Metadata = buildPageMetadata({
  title: "AI Chat — Ask Questions About Your Documents",
  description:
    "Chat with your documents using AI. Ask questions, get summaries, and find information instantly.",
  path: "/chat",
  keywords: ["ai document chat", "chat with pdf", "ai pdf assistant"],
});

export default function Page() {
  return <ChatView />;
}
