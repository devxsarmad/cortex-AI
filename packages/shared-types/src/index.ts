export type ApiErrorResponse = {
  error: string;
  details?: unknown;
};


export type ChatRole = "user" | "assistant";

export type ChatMessageDto = {
  role: ChatRole;
  content: string;
};

export type StreamChatDto = {
  messages: ChatMessageDto[];
};

export type DocumentStatus = "uploaded" | "processing" | "ready" | "needs_parser" | "failed";

export type EmbeddingProvider = "openai" | "mock";
export type VectorStoreProvider = "memory" | "qdrant";

export type DocumentDto = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  status: DocumentStatus;
  characterCount: number;
  chunkCount: number;
  embeddingProvider: EmbeddingProvider | null;
  vectorStoreProvider: VectorStoreProvider | null;
  errorMessage: string | null;
  processingAttempts: number;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
};

export type DocumentDetailDto = DocumentDto & {
  extractedText: string;
};

export type DocumentChunkDto = {
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

export type UploadDocumentDto = {
  document: DocumentDetailDto;
};

export type ListDocumentsDto = {
  documents: DocumentDto[];
};

export type ListDocumentChunksDto = {
  chunks: DocumentChunkDto[];
};

export type DocumentSearchResultDto = {
  id: string;
  documentId: string;
  filename: string;
  chunkIndex: number;
  content: string;
  characterCount: number;
  tokenEstimate: number;
  embeddingProvider: EmbeddingProvider;
  createdAt: string;
  score: number;
};

export type SearchDocumentsDto = {
  query: string;
  limit?: number;
  documentId?: string;
};

export type SearchDocumentsResponseDto = {
  results: DocumentSearchResultDto[];
};
