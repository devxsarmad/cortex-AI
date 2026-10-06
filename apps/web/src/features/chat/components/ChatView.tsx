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
  const [loadingConversationId, setLoadingConversationId] = useState<string | undefined>();
  const [deletingConversationId, setDeletingConversationId] = useState<string | undefined>();
  const [conversationError, setConversationError] = useState<string | null>(null);

  const refreshConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      setConversationError(null);
      setConversations(await listConversations());
    } catch (error) {
      setConversationError(error instanceof Error ? error.message : "Could not load chat sessions.");
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
    setConversationError(null);
    setActiveConversationId(undefined);
    resetMessages();
  };

  const handleSelectConversation = async (conversationId: string) => {
    try {
      setConversationError(null);
      setLoadingConversationId(conversationId);
      const conversation = await getConversation(conversationId);
      setActiveConversationId(conversation.id);
      setSelectedDocumentIds(conversation.documentIds);
      restoreMessages(
        conversation.messages.map((message) => ({
          ...message,
          id: createId()
        }))
      );
    } catch (error) {
      setConversationError(error instanceof Error ? error.message : "Could not restore chat session.");
    } finally {
      setLoadingConversationId(undefined);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      setConversationError(null);
      setDeletingConversationId(conversationId);
      await deleteConversation(conversationId);
      if (activeConversationId === conversationId) {
        handleNewChat();
      }
      await refreshConversations();
    } catch (error) {
      setConversationError(error instanceof Error ? error.message : "Could not delete chat session.");
    } finally {
      setDeletingConversationId(undefined);
    }
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
      loadingConversationId={loadingConversationId}
      deletingConversationId={deletingConversationId}
      isLoadingConversations={isLoadingConversations}
      conversationError={conversationError}
      onNewChat={handleNewChat}
      onSelectConversation={(conversationId) => void handleSelectConversation(conversationId)}
      onDeleteConversation={(conversationId) => void handleDeleteConversation(conversationId)}
    >
      <div className="flex min-h-[70vh] flex-col">
        <DocumentPanel
          selectedDocumentIds={selectedDocumentIds}
          onSelectedDocumentIdsChange={setSelectedDocumentIds}
        />
        <MessageList messages={messages} selectedDocumentCount={selectedDocumentIds.length} />
        <PromptSuggestions disabled={isStreaming} onSelect={(prompt) => void sendMessage(prompt)} />
        <ChatComposer
          isStreaming={isStreaming}
          selectedDocumentCount={selectedDocumentIds.length}
          onSubmit={(content) => void sendMessage(content)}
        />
      </div>
    </AppShell>
  );
}
