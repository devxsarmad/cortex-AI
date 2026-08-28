import type { RagSource } from "../rag/rag.types.js";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type StreamChatRequest = {
  messages: ChatMessage[];
  documentIds?: string[];
};

export type ChatSource = RagSource;

export type ChatStreamMeta = {
  provider: string;
  retrieval: {
    sourceCount: number;
    scopedDocumentCount: number;
    vectorStoreProvider: string;
  };
};
