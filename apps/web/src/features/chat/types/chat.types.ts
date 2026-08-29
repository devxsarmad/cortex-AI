export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  sources?: ChatSource[];
  tools?: ChatToolResult[];
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
    scopedDocumentCount: number;
    vectorStoreProvider: string;
  };
  tools: {
    executedCount: number;
  };
};

export type ChatToolResult = {
  id: string;
  name: "calculator" | "current_time" | "document_stats";
  label: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: "success" | "error";
  errorMessage?: string;
};
