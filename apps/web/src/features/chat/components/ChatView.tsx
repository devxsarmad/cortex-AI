"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  deleteConversation,
  getConversation,
  listConversations
} from "@/services/conversation.service";
import { ChatComposer } from "./ChatComposer";
import { MessageList } from "./MessageList";
import { PromptSuggestions } from "./PromptSuggestions";
import { DocumentPanel } from "@/features/documents/components/DocumentPanel";
import { useChat } from "../hooks/useChat";
import type { ConversationSummary } from "../types/conversation.types";

const createId = () => crypto.randomUUID();

export function ChatView() {
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  const refreshConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      setConversations(await listConversations());
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  const {
    messages,
    isStreaming,
    provider,
    agentRoute,
    agentTraceCount,
    retrievalStrategy,
    retrievalQueryCount,
    restoreMessages,
    resetMessages,
    sendMessage
  } = useChat({
    documentIds: selectedDocumentIds,
    conversationId: activeConversationId,
    onConversationCreated: setActiveConversationId,
    onConversationSaved: () => void refreshConversations()
  });

  useEffect(() => {
    void refreshConversations();
  }, [refreshConversations]);

  const handleNewChat = () => {
    setActiveConversationId(undefined);
    resetMessages();
  };

  const handleSelectConversation = async (conversationId: string) => {
    const conversation = await getConversation(conversationId);
    setActiveConversationId(conversation.id);
    setSelectedDocumentIds(conversation.documentIds);
    restoreMessages(
      conversation.messages.map((message) => ({
        ...message,
        id: createId()
      }))
    );
  };

  const handleDeleteConversation = async (conversationId: string) => {
    await deleteConversation(conversationId);
    if (activeConversationId === conversationId) {
      handleNewChat();
    }
    await refreshConversations();
  };

  return (
    <AppShell
      provider={provider}
      agentRoute={agentRoute}
      agentTraceCount={agentTraceCount}
      retrievalStrategy={retrievalStrategy}
      retrievalQueryCount={retrievalQueryCount}
      conversations={conversations}
      activeConversationId={activeConversationId}
      isLoadingConversations={isLoadingConversations}
      onNewChat={handleNewChat}
      onSelectConversation={(conversationId) => void handleSelectConversation(conversationId)}
      onDeleteConversation={(conversationId) => void handleDeleteConversation(conversationId)}
    >
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
