import type { EmbeddedChunk, EmbeddingProvider } from "../embeddings/embedding.types.js";
import type { VectorSearchResult, VectorStoreProvider } from "../../infrastructure/vector-db/vector-store.types.js";

export type DocumentStatus = "uploaded" | "processing" | "ready" | "needs_parser" | "failed";

export type DocumentChunk = EmbeddedChunk & {
  id: string;
  documentId: string;
  embeddingProvider: EmbeddingProvider;
  createdAt: string;
};

export type DocumentRecord = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  status: DocumentStatus;
  extractedText: string;
  characterCount: number;
  chunkCount: number;
  embeddingProvider: EmbeddingProvider | null;
  vectorStoreProvider: VectorStoreProvider | null;
  errorMessage: string | null;
  processingAttempts: number;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
  chunks: DocumentChunk[];
};

export type DocumentSummary = Omit<DocumentRecord, "extractedText" | "chunks">;
export type DocumentDetail = Omit<DocumentRecord, "chunks">;

export type UploadDocumentResponse = {
  document: DocumentDetail;
};

export type ListDocumentsResponse = {
  documents: DocumentSummary[];
};

export type ListDocumentChunksResponse = {
  chunks: DocumentChunk[];
};

export type SearchDocumentsResponse = {
  results: VectorSearchResult[];
};
