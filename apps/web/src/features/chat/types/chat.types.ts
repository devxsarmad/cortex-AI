export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  sources?: ChatSource[];
};

export type ChatSource = {
  id: string;
  documentId: string;
  filename: string;
  chunkIndex: number;
  content: string;
  score: number;
};

export type ChatProviderMeta = {
  provider: string;
  retrieval: {
    sourceCount: number;
    vectorStoreProvider: string;
  };
};
