"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ChatComposer } from "./ChatComposer";
import { MessageList } from "./MessageList";
import { PromptSuggestions } from "./PromptSuggestions";
import { DocumentPanel } from "@/features/documents/components/DocumentPanel";
import { useChat } from "../hooks/useChat";

export function ChatView() {
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const { messages, isStreaming, provider, agentRoute, agentTraceCount, sendMessage } = useChat({
    documentIds: selectedDocumentIds
  });

  return (
    <AppShell provider={provider} agentRoute={agentRoute} agentTraceCount={agentTraceCount}>
      <div className="flex min-h-[70vh] flex-col">
        <DocumentPanel
          selectedDocumentIds={selectedDocumentIds}
          onSelectedDocumentIdsChange={setSelectedDocumentIds}
        />
        <MessageList messages={messages} />
        <PromptSuggestions disabled={isStreaming} onSelect={(prompt) => void sendMessage(prompt)} />
        <ChatComposer isStreaming={isStreaming} onSubmit={(content) => void sendMessage(content)} />
      </div>
    </AppShell>
  );
}
