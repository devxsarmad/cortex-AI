export type EmbeddingProvider = "openai" | "mock";

export type DocumentStatus = "ready" | "needs_parser" | "failed";

export type DocumentSummary = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  status: DocumentStatus;
  characterCount: number;
  chunkCount: number;
  embeddingProvider: EmbeddingProvider | null;
  createdAt: string;
};

export type DocumentDetail = DocumentSummary & {
  extractedText: string;
};

export type DocumentChunk = {
  id: string;
  documentId: string;
  index: number;
  content: string;
  characterCount: number;
  tokenEstimate: number;
  embedding: number[];
  embeddingProvider: EmbeddingProvider;
  createdAt: string;
};
