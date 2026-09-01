import type { ChatMessage } from "../chat/chat.types.js";

export type ConversationRecord = {
  id: string;
  title: string;
  messages: ChatMessage[];
  documentIds: string[];
  messageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ConversationSummary = Omit<ConversationRecord, "messages">;
export type ConversationDetail = ConversationRecord;

export type CreateConversationInput = {
  title?: string;
};

export type UpdateConversationMessagesInput = {
  messages: ChatMessage[];
  documentIds?: string[];
};
