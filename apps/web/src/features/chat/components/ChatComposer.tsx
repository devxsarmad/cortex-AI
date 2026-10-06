"use client";

import { FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatComposerProps = {
  isStreaming: boolean;
  selectedDocumentCount: number;
  onSubmit: (content: string) => void;
};

export function ChatComposer({ isStreaming, selectedDocumentCount, onSubmit }: ChatComposerProps) {
  const [input, setInput] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const canSubmit = input.trim().length > 0 && !isStreaming;
  const contextLabel =
    selectedDocumentCount > 0
      ? `Using ${selectedDocumentCount} selected source${selectedDocumentCount === 1 ? "" : "s"}`
      : "No sources selected";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(input);
    setInput("");
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>{contextLabel}</span>
        {isStreaming && <span>Generating answer...</span>}
      </div>
      <div className="flex gap-3">
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
          placeholder={
            selectedDocumentCount > 0
              ? "Ask a question about the selected sources..."
              : "Ask a general question, or select sources for document-backed answers..."
          }
          rows={2}
          className="flex-1"
        />
        <Button type="submit" disabled={!canSubmit} className="h-14 px-5">
          {isStreaming ? "Streaming" : "Send"}
        </Button>
      </div>
    </form>
  );
}
