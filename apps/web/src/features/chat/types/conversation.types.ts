import type { ChatMessage } from "./chat.types";

export type ConversationSummary = {
  id: string;
  title: string;
  documentIds: string[];
  messageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ConversationDetail = ConversationSummary & {
  messages: Omit<ChatMessage, "id" | "sources" | "tools">[];
};
