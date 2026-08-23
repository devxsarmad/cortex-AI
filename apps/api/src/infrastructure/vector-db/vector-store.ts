import { env } from "../../config/env.js";
import { MemoryVectorStore } from "./memory-vector-store.js";
import { QdrantVectorStore } from "./qdrant-vector-store.js";
import type { VectorStore } from "./vector-store.types.js";

export const createVectorStore = (): VectorStore => {
  if (env.vectorStoreProvider === "qdrant") {
    return new QdrantVectorStore();
  }

  return new MemoryVectorStore();
};

export const vectorStore = createVectorStore();
