export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type StreamChatRequest = {
  messages: ChatMessage[];
  documentIds?: string[];
};

export type ChatSource = {
  id: string;
  documentId: string;
  filename: string;
  chunkIndex: number;
  content: string;
  score: number;
};

export type ChatStreamMeta = {
  provider: string;
  retrieval: {
    sourceCount: number;
    scopedDocumentCount: number;
    vectorStoreProvider: string;
  };
};
