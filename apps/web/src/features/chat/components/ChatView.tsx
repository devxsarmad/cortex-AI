"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ChatComposer } from "./ChatComposer";
import { MessageList } from "./MessageList";
import { PromptSuggestions } from "./PromptSuggestions";
import { DocumentPanel } from "@/features/documents/components/DocumentPanel";
import { useChat } from "../hooks/useChat";
import { useConversations } from "../hooks/useConversations";

const createId = () => crypto.randomUUID();

export function ChatView() {
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const { conversationsQuery, loadMutation, deleteMutation } = useConversations();

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
    onConversationCreated: setActiveConversationId
  });

  const handleNewChat = () => {
    setActiveConversationId(undefined);
    resetMessages();
  };

  const handleSelectConversation = async (conversationId: string) => {
    try {
      const conversation = await loadMutation.mutateAsync(conversationId);
      setActiveConversationId(conversation.id);
      setSelectedDocumentIds(conversation.documentIds);
      restoreMessages(
        conversation.messages.map((message) => ({
          ...message,
          id: createId()
        }))
      );
    } catch (error) {
      void error;
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteMutation.mutateAsync(conversationId);
      if (activeConversationId === conversationId) {
        handleNewChat();
      }
    } catch (error) {
      void error;
    }
  };

  return (
    <AppShell
      provider={provider}
      agentRoute={agentRoute}
      agentTraceCount={agentTraceCount}
      retrievalStrategy={retrievalStrategy}
      retrievalQueryCount={retrievalQueryCount}
      conversations={conversationsQuery.data ?? []}
      activeConversationId={activeConversationId}
      loadingConversationId={loadMutation.isPending ? loadMutation.variables : undefined}
      deletingConversationId={deleteMutation.isPending ? deleteMutation.variables : undefined}
      isLoadingConversations={conversationsQuery.isPending}
      conversationError={(loadMutation.error ?? deleteMutation.error ?? conversationsQuery.error)?.message}
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
