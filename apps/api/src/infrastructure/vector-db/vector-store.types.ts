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

export interface VectorStore {
  readonly provider: VectorStoreProvider;
  upsert(points: VectorPoint[]): Promise<void>;
  search(input: { embedding: number[]; limit: number; documentId?: string }): Promise<VectorSearchResult[]>;
}
