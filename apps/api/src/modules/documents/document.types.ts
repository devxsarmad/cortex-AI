import type { EmbeddedChunk, EmbeddingProvider } from "../embeddings/embedding.types.js";

export type DocumentStatus = "ready" | "needs_parser" | "failed";

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
  createdAt: string;
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
