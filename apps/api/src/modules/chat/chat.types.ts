export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type StreamChatRequest = {
  messages: ChatMessage[];
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
    vectorStoreProvider: string;
  };
};
