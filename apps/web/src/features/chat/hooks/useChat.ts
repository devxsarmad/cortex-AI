"use client";

import { useState } from "react";
import { streamChat } from "@/services/chat.service";
import type { ChatMessage } from "../types/chat.types";

const starterMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hi, I am Cortex. Ask a healthcare research question and I will help you work through it clearly."
  }
];

const createId = () => crypto.randomUUID();

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [provider, setProvider] = useState("not connected");

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

    setMessages(nextMessages);
    setIsStreaming(true);

    try {
      await streamChat({
        messages: nextMessages.filter((message) => message.id !== assistantMessage.id),
        onMeta: (meta) => setProvider(meta.provider),
        onSources: (sources) => {
          setMessages((current) =>
            current.map((message) => (message.id === assistantMessage.id ? { ...message, sources } : message))
          );
        },
        onToken: (token) => {
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessage.id
                ? { ...message, content: message.content + token }
                : message
            )
          );
        }
      });
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

  return {
    messages,
    isStreaming,
    provider,
    sendMessage
  };
};
