import type { ChatMessage } from "../chat/chat.types.js";

export type ConversationRecord = {
  id: string;
  organizationId: string;
  createdById: string | null;
  title: string;
  messages: ChatMessage[];
  documentIds: string[];
  messageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ConversationSummary = Omit<ConversationRecord, "organizationId" | "createdById" | "messages">;
export type ConversationDetail = Omit<ConversationRecord, "organizationId" | "createdById">;

export type CreateConversationInput = {
  title?: string;
};

export type UpdateConversationMessagesInput = {
  messages: ChatMessage[];
  documentIds?: string[];
};
