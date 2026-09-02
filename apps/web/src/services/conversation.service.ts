import type { ConversationDetail, ConversationSummary } from "@/features/chat/types/conversation.types";
import type { ChatMessage } from "@/features/chat/types/chat.types";
import { API_URL, createApiHeaders } from "./api-client";

type ConversationPayload = {
  conversation: ConversationDetail;
};

type ListConversationsPayload = {
  conversations: ConversationSummary[];
};

type DeleteConversationPayload = {
  conversationId: string;
};

const toPersistedMessages = (messages: ChatMessage[]) => {
  return messages
    .filter((message) => message.id !== "welcome")
    .map(({ role, content }) => ({ role, content }))
    .filter((message) => message.content.trim().length > 0);
};

export const createConversation = async () => {
  const response = await fetch(`${API_URL}/api/conversations`, {
    method: "POST",
    headers: createApiHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({})
  });

  if (!response.ok) {
    throw new Error("Could not create chat session.");
  }

  const payload = (await response.json()) as ConversationPayload;
  return payload.conversation;
};

export const listConversations = async () => {
  const response = await fetch(`${API_URL}/api/conversations`, {
    headers: createApiHeaders()
  });

  if (!response.ok) {
    throw new Error("Could not load chat sessions.");
  }

  const payload = (await response.json()) as ListConversationsPayload;
  return payload.conversations;
};

export const getConversation = async (conversationId: string) => {
  const response = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
    headers: createApiHeaders()
  });

  if (!response.ok) {
    throw new Error("Could not restore chat session.");
  }

  const payload = (await response.json()) as ConversationPayload;
  return payload.conversation;
};

export const saveConversationMessages = async (
  conversationId: string,
  messages: ChatMessage[],
  documentIds: string[]
) => {
  const response = await fetch(`${API_URL}/api/conversations/${conversationId}/messages`, {
    method: "PUT",
    headers: createApiHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({
      messages: toPersistedMessages(messages),
      documentIds
    })
  });

  if (!response.ok) {
    throw new Error("Could not save chat session.");
  }

  const payload = (await response.json()) as ConversationPayload;
  return payload.conversation;
};

export const deleteConversation = async (conversationId: string) => {
  const response = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
    method: "DELETE",
    headers: createApiHeaders()
  });

  if (!response.ok) {
    throw new Error("Could not delete chat session.");
  }

  const payload = (await response.json()) as DeleteConversationPayload;
  return payload.conversationId;
};
