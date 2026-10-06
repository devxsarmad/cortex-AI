import type { ChatMessage } from "../chat/chat.types.js";

export type ConversationRecord = {
  id: string;
  ownerId: string;
  title: string;
  messages: ChatMessage[];
  documentIds: string[];
  messageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ConversationSummary = Omit<ConversationRecord, "ownerId" | "messages">;
export type ConversationDetail = Omit<ConversationRecord, "ownerId">;

export type CreateConversationInput = {
  title?: string;
};

export type UpdateConversationMessagesInput = {
  messages: ChatMessage[];
  documentIds?: string[];
};
