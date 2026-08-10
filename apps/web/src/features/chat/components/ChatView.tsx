"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ChatComposer } from "./ChatComposer";
import { MessageList } from "./MessageList";
import { PromptSuggestions } from "./PromptSuggestions";
import { useChat } from "../hooks/useChat";

export function ChatView() {
  const { messages, isStreaming, provider, sendMessage } = useChat();

  return (
    <AppShell provider={provider}>
      <div className="flex min-h-[70vh] flex-col">
        <MessageList messages={messages} />
        <PromptSuggestions disabled={isStreaming} onSelect={(prompt) => void sendMessage(prompt)} />
        <ChatComposer isStreaming={isStreaming} onSubmit={(content) => void sendMessage(content)} />
      </div>
    </AppShell>
  );
}
