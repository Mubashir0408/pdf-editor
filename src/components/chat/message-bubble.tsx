"use client";

import { motion } from "framer-motion";
import { Sparkles, FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import { currentUser } from "@/lib/mock-data";
import { initials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ChatMessage } from "@/lib/types";

export function MessageBubble({
  message,
  onViewSources,
}: {
  message: ChatMessage;
  onViewSources?: () => void;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex w-full gap-3", isUser && "flex-row-reverse")}
    >
      <Avatar className="mt-0.5 size-8 shrink-0">
        {isUser ? (
          <AvatarFallback>{initials(currentUser.name)}</AvatarFallback>
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-secondary to-primary">
            <Sparkles className="size-4 text-white" />
          </AvatarFallback>
        )}
      </Avatar>

      <div className={cn("flex max-w-[80%] flex-col gap-2 sm:max-w-[70%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm"
          )}
        >
          {message.content}
        </div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <button
            onClick={onViewSources}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <FileText className="size-3" />
            {message.sources.length} source{message.sources.length > 1 ? "s" : ""}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function TypingBubble() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full gap-3">
      <Avatar className="mt-0.5 size-8 shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-secondary to-primary">
          <Sparkles className="size-4 text-white" />
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1.5 rounded-full bg-muted-foreground/60"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function ModelBadge() {
  return (
    <Badge variant="secondary" className="gap-1">
      <Sparkles className="size-3" /> DocuFlow Assistant
    </Badge>
  );
}
