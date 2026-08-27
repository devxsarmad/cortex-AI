import type { EmbeddingProvider } from "../../modules/embeddings/embedding.types.js";

export type VectorStoreProvider = "memory" | "qdrant";

export type VectorPoint = {
  id: string;
  documentId: string;
  filename: string;
  chunkIndex: number;
  content: string;
  characterCount: number;
  tokenEstimate: number;
  embedding: number[];
  embeddingProvider: EmbeddingProvider;
  createdAt: string;
};

export type VectorSearchResult = Omit<VectorPoint, "embedding"> & {
  score: number;
};

export type VectorSearchInput = {
  embedding: number[];
  limit: number;
  documentId?: string;
  documentIds?: string[];
};

export interface VectorStore {
  readonly provider: VectorStoreProvider;
  upsert(points: VectorPoint[]): Promise<void>;
  search(input: VectorSearchInput): Promise<VectorSearchResult[]>;
  deleteByDocumentId(documentId: string): Promise<void>;
}
