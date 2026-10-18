import type { ConversationDetail, ConversationSummary } from "@/features/chat/types/conversation.types";
import type { ChatMessage } from "@/features/chat/types/chat.types";
import { apiRequest } from "./api-client";

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
  const payload = await apiRequest<ConversationPayload>("/api/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  });

  return payload.conversation;
};

export const listConversations = async () => {
  const payload = await apiRequest<ListConversationsPayload>("/api/conversations");
  return payload.conversations;
};

export const getConversation = async (conversationId: string) => {
  const payload = await apiRequest<ConversationPayload>(`/api/conversations/${conversationId}`);
  return payload.conversation;
};

export const saveConversationMessages = async (
  conversationId: string,
  messages: ChatMessage[],
  documentIds: string[]
) => {
  const payload = await apiRequest<ConversationPayload>(`/api/conversations/${conversationId}/messages`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messages: toPersistedMessages(messages),
      documentIds
    })
  });

  return payload.conversation;
};

export const deleteConversation = async (conversationId: string) => {
  const payload = await apiRequest<DeleteConversationPayload>(`/api/conversations/${conversationId}`, { method: "DELETE" });
  return payload.conversationId;
};
