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

export type DocumentStatus = "ready" | "needs_parser" | "failed";

export type EmbeddingProvider = "openai" | "mock";

export type DocumentDto = {
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
