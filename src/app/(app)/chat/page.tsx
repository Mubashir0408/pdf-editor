"use client";

import * as React from "react";
import { Sparkles, PanelRightOpen, MessageSquarePlus, FileText } from "lucide-react";

import { SourcesPanel } from "@/components/chat/sources-panel";
import { MessageBubble, TypingBubble, ModelBadge } from "@/components/chat/message-bubble";
import { ChatComposer } from "@/components/chat/composer";
import { Button } from "@/components/ui/button";
import { RightPanel, RightPanelSheet } from "@/components/layout/right-panel";
import { suggestedPrompts } from "@/lib/mock-data";
import { useRecordToolUsage } from "@/hooks/use-recent-tools";
import type { ChatMessage, ChatSource } from "@/lib/types";

const CANNED_RESPONSES: { content: string; sources: ChatSource[] }[] = [
  {
    content:
      "Here's a summary of the key points: the document outlines three main priorities, with the highest-impact item being the Q3 rollout timeline. Two dependencies are flagged on page 4 that should be resolved before kickoff.",
    sources: [
      { id: "sx1", fileName: "Attached document", page: 2, snippet: "Three strategic priorities are outlined for the upcoming quarter..." },
      { id: "sx2", fileName: "Attached document", page: 4, snippet: "Two dependencies must be resolved prior to the rollout kickoff..." },
    ],
  },
  {
    content:
      "I found relevant figures on pages 6 and 9. Revenue-related numbers increased notably, while operating costs stayed roughly flat quarter over quarter — worth highlighting in your summary.",
    sources: [
      { id: "sx3", fileName: "Attached document", page: 6, snippet: "Revenue increased 18% compared to the prior quarter..." },
      { id: "sx4", fileName: "Attached document", page: 9, snippet: "Operating costs remained flat at approximately $1.2M..." },
    ],
  },
  {
    content:
      "Based on the document, here are the risks called out explicitly: vendor lock-in on page 3, a compliance deadline on page 7, and an unresolved staffing gap mentioned in the appendix.",
    sources: [
      { id: "sx5", fileName: "Attached document", page: 3, snippet: "Reliance on a single vendor introduces switching-cost risk..." },
      { id: "sx6", fileName: "Attached document", page: 7, snippet: "Compliance filing is due within 30 days of publication..." },
    ],
  },
];

let responseIndex = 0;

export default function ChatPage() {
  useRecordToolUsage("ai-chat");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const [attachedFile, setAttachedFile] = React.useState<File | null>(null);
  const [sourcesOpen, setSourcesOpen] = React.useState(false);
  const [activeSources, setActiveSources] = React.useState<ChatSource[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const handleNewChat = () => {
    setMessages([]);
    setAttachedFile(null);
    setActiveSources([]);
  };

  const send = (text: string) => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const canned = CANNED_RESPONSES[responseIndex % CANNED_RESPONSES.length];
      responseIndex += 1;
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: canned.content,
        timestamp: new Date().toISOString(),
        sources: canned.sources,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setActiveSources(canned.sources);
      setIsTyping(false);
    }, 1400);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-[calc(100svh-4rem)]">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
          <div>
            <p className="text-sm font-semibold text-foreground">AI Chat</p>
            {attachedFile && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <FileText className="size-3" /> {attachedFile.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={handleNewChat} disabled={!hasMessages}>
              <MessageSquarePlus className="size-4" /> New chat
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden"
              onClick={() => setSourcesOpen(true)}
              aria-label="View sources"
            >
              <PanelRightOpen className="size-4" />
            </Button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6 sm:px-6">
          <div className="mx-auto flex max-w-2xl flex-col gap-5">
            {!hasMessages ? (
              <div className="flex flex-col items-center gap-6 py-10 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25">
                  <Sparkles className="size-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Ask DocuFlow AI anything</h1>
                  <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                    Attach a document and ask questions, or start typing to chat freely. No account needed.
                  </p>
                </div>
                <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => send(prompt)}
                      className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-left text-sm text-foreground outline-none transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  <ModelBadge />
                </div>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onViewSources={() => {
                      setActiveSources(message.sources ?? []);
                      setSourcesOpen(true);
                    }}
                  />
                ))}
                {isTyping && <TypingBubble />}
              </>
            )}
          </div>
        </div>

        <div className="mx-auto w-full max-w-2xl">
          <ChatComposer
            onSend={send}
            attachedFile={attachedFile}
            onAttach={setAttachedFile}
            onRemoveAttachment={() => setAttachedFile(null)}
            disabled={isTyping}
          />
        </div>
      </div>

      {/* Desktop docked right panel */}
      <RightPanel title="Sources">
        <SourcesPanel sources={activeSources} />
      </RightPanel>

      {/* Mobile/tablet right panel drawer */}
      <RightPanelSheet title="Sources" open={sourcesOpen} onOpenChange={setSourcesOpen}>
        <SourcesPanel sources={activeSources} />
      </RightPanelSheet>
    </div>
  );
}
