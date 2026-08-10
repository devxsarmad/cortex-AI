"use client";

import { FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatComposerProps = {
  isStreaming: boolean;
  onSubmit: (content: string) => void;
};

export function ChatComposer({ isStreaming, onSubmit }: ChatComposerProps) {
  const [input, setInput] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const canSubmit = input.trim().length > 0 && !isStreaming;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(input);
    setInput("");
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mt-4 flex gap-3">
      <Textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            formRef.current?.requestSubmit();
          }
        }}
        placeholder="Ask a healthcare knowledge question..."
        rows={2}
        className="flex-1"
      />
      <Button type="submit" disabled={!canSubmit} className="h-14 px-5">
        {isStreaming ? "Streaming" : "Send"}
      </Button>
    </form>
  );
}
