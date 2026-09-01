"use client";

import { useState } from "react";
import { streamChat } from "@/services/chat.service";
import { createConversation, saveConversationMessages } from "@/services/conversation.service";
import type { ChatMessage, ChatSource, ChatToolResult } from "../types/chat.types";

const starterMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hi, I am Cortex. Ask a healthcare research question and I will help you work through it clearly."
  }
];

const createId = () => crypto.randomUUID();

type UseChatOptions = {
  documentIds: string[];
  conversationId?: string;
  onConversationCreated?: (conversationId: string) => void;
  onConversationSaved?: () => void;
};

export const useChat = ({
  documentIds,
  conversationId,
  onConversationCreated,
  onConversationSaved
}: UseChatOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [provider, setProvider] = useState("not connected");
  const [agentRoute, setAgentRoute] = useState("idle");
  const [agentTraceCount, setAgentTraceCount] = useState(0);
  const [retrievalStrategy, setRetrievalStrategy] = useState("none");
  const [retrievalQueryCount, setRetrievalQueryCount] = useState(0);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: trimmed
    };
    const assistantMessage: ChatMessage = {
      id: createId(),
      role: "assistant",
      content: ""
    };
    const nextMessages = [...messages, userMessage, assistantMessage];
    let activeConversationId = conversationId;
    let assistantContent = "";
    let assistantSources: ChatSource[] = [];
    let assistantTools: ChatToolResult[] = [];

    setMessages(nextMessages);
    setIsStreaming(true);

    try {
      if (!activeConversationId) {
        const conversation = await createConversation();
        activeConversationId = conversation.id;
        onConversationCreated?.(conversation.id);
      }

      await streamChat({
        messages: nextMessages.filter((message) => message.id !== assistantMessage.id),
        documentIds,
        onMeta: (meta) => {
          setProvider(meta.provider);
          setAgentRoute(meta.agent.route);
          setAgentTraceCount(meta.agent.trace.length);
          setRetrievalStrategy(meta.retrieval.strategy);
          setRetrievalQueryCount(meta.retrieval.queryCount);
        },
        onSources: (sources) => {
          assistantSources = sources;
          setMessages((current) =>
            current.map((message) => (message.id === assistantMessage.id ? { ...message, sources } : message))
          );
        },
        onTools: (tools) => {
          assistantTools = tools;
          setMessages((current) =>
            current.map((message) => (message.id === assistantMessage.id ? { ...message, tools } : message))
          );
        },
        onToken: (token) => {
          assistantContent += token;
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessage.id
                ? { ...message, content: message.content + token }
                : message
            )
          );
        }
      });

      const completedMessages = nextMessages.map((message) =>
        message.id === assistantMessage.id
          ? {
              ...message,
              content: assistantContent,
              sources: assistantSources,
              tools: assistantTools
            }
          : message
      );

      if (activeConversationId) {
        await saveConversationMessages(activeConversationId, completedMessages, documentIds);
        onConversationSaved?.();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      setMessages((current) =>
        current.map((item) =>
          item.id === assistantMessage.id
            ? { ...item, content: `I could not complete the response: ${message}` }
            : item
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const restoreMessages = (nextMessages: ChatMessage[]) => {
    setMessages(nextMessages.length > 0 ? nextMessages : starterMessages);
  };

  const resetMessages = () => {
    setMessages(starterMessages);
    setAgentRoute("idle");
    setAgentTraceCount(0);
    setRetrievalStrategy("none");
    setRetrievalQueryCount(0);
  };

  return {
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
  };
};
