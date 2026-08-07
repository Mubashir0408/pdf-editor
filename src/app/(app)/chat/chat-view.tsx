"use client";

import * as React from "react";
import { Sparkles, PanelRightOpen, MessageSquarePlus, FileText } from "lucide-react";
import { toast } from "sonner";

import { SourcesPanel } from "@/components/chat/sources-panel";
import { MessageBubble, TypingBubble, ModelBadge } from "@/components/chat/message-bubble";
import { ChatComposer } from "@/components/chat/composer";
import { Button } from "@/components/ui/button";
import { RightPanel, RightPanelSheet } from "@/components/layout/right-panel";
import { suggestedPrompts } from "@/lib/mock-data";
import { useSingleFileUpload } from "@/hooks/use-single-file-upload";
import { sendChatMessage } from "@/lib/api/chat";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { ChatMessage, ChatSource } from "@/lib/types";

export default function ChatPage() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const [sourcesOpen, setSourcesOpen] = React.useState(false);
  const [activeSources, setActiveSources] = React.useState<ChatSource[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const attachment = useSingleFileUpload();

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  React.useEffect(() => {
    if (attachment.status === "error" && attachment.error) {
      toast.error(attachment.error);
    }
  }, [attachment.status, attachment.error]);

  const handleNewChat = () => {
    setMessages([]);
    attachment.reset();
  };

  const send = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const { reply } = await sendChatMessage(text, attachment.uploadedId ?? undefined);
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const message = getApiErrorMessage(err);
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: `Sorry, I ran into a problem: ${message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      toast.error(message);
    } finally {
      setIsTyping(false);
    }
  };

  const hasMessages = messages.length > 0;
  const isBusy = isTyping || attachment.status === "uploading";

  return (
    <div className="flex h-[calc(100svh-4rem)]">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
          <div>
            <p className="text-sm font-semibold text-foreground">AI Chat</p>
            {attachment.file && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <FileText className="size-3" />
                {attachment.file.name}
                {attachment.status === "uploading" && " (uploading…)"}
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
            attachedFile={attachment.file}
            onAttach={attachment.upload}
            onRemoveAttachment={attachment.reset}
            disabled={isBusy}
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
