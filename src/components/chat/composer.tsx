"use client";

import * as React from "react";
import { Paperclip, SendHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileIcon } from "@/components/shared/file-icon";
import { inferFileType } from "@/components/tools/selected-file-row";

export function ChatComposer({
  onSend,
  attachedFile,
  onAttach,
  onRemoveAttachment,
  disabled,
}: {
  onSend: (text: string) => void;
  attachedFile: File | null;
  onAttach: (file: File) => void;
  onRemoveAttachment: () => void;
  disabled?: boolean;
}) {
  const [value, setValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <div className="border-t border-border bg-background/80 p-3 backdrop-blur-lg sm:p-4">
      {attachedFile && (
        <div className="mb-2 flex w-fit items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-1.5">
          <FileIcon type={inferFileType(attachedFile.name)} className="size-7" />
          <span className="max-w-40 truncate text-xs font-medium text-foreground">
            {attachedFile.name}
          </span>
          <button
            onClick={onRemoveAttachment}
            aria-label="Remove attachment"
            className="rounded outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) onAttach(e.target.files[0]);
            e.target.value = "";
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => inputRef.current?.click()}
          aria-label="Attach a document"
        >
          <Paperclip className="size-[18px]" />
        </Button>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Ask anything about your document..."
          className="max-h-40 min-h-9 flex-1 resize-none border-0 shadow-none focus-visible:ring-0 px-1 py-1.5"
          rows={1}
        />
        <Button
          size="icon"
          variant="gradient"
          className="shrink-0"
          disabled={!value.trim() || disabled}
          onClick={submit}
          aria-label="Send message"
        >
          <SendHorizontal className="size-4" />
        </Button>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground/70">
        Docy can make mistakes. Verify important information.
      </p>
    </div>
  );
}
