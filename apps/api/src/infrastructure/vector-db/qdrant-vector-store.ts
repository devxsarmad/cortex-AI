import { env } from "../../config/env.js";
import type { VectorPoint, VectorSearchInput, VectorSearchResult, VectorStore } from "./vector-store.types.js";

type QdrantPoint = {
  id: string;
  vector: number[];
  payload: Omit<VectorPoint, "embedding">;
};

type QdrantSearchPoint = {
  id: string;
  score: number;
  payload?: Omit<VectorPoint, "embedding">;
};

const qdrantRequest = async <TResponse>(path: string, init?: RequestInit) => {
  const response = await fetch(`${env.qdrantUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Qdrant request failed: ${response.status} ${body}`);
  }

  return (await response.json()) as TResponse;
};

export class QdrantVectorStore implements VectorStore {
  readonly provider = "qdrant";

  private collectionReadyForSize: number | null = null;

  async upsert(points: VectorPoint[]) {
    if (points.length === 0) return;

    const vectorSize = points[0]?.embedding.length ?? 0;
    await this.ensureCollection(vectorSize);

    const qdrantPoints: QdrantPoint[] = points.map(({ embedding, ...payload }) => ({
      id: payload.id,
      vector: embedding,
      payload
    }));

    await qdrantRequest(`/collections/${env.qdrantCollection}/points?wait=true`, {
      method: "PUT",
      body: JSON.stringify({
        points: qdrantPoints
      })
    });
  }

  async search(input: VectorSearchInput) {
    await this.ensureCollection(input.embedding.length);
    const documentIds = input.documentIds ?? (input.documentId ? [input.documentId] : []);

    const filter = documentIds.length > 0
      ? {
          must: [
            {
              key: "documentId",
              match: {
                ...(documentIds.length === 1 ? { value: documentIds[0] } : { any: documentIds })
              }
            }
          ]
        }
      : undefined;

    const response = await qdrantRequest<{ result: QdrantSearchPoint[] }>(
      `/collections/${env.qdrantCollection}/points/search`,
      {
        method: "POST",
        body: JSON.stringify({
          vector: input.embedding,
          limit: input.limit,
          with_payload: true,
          filter
        })
      }
    );

    return response.result.flatMap((point): VectorSearchResult[] => {
      if (!point.payload) return [];

      return [
        {
          ...point.payload,
          score: point.score
        }
      ];
    });
  }

  async deleteByDocumentId(documentId: string) {
    await qdrantRequest(`/collections/${env.qdrantCollection}/points/delete?wait=true`, {
      method: "POST",
      body: JSON.stringify({
        filter: {
          must: [
            {
              key: "documentId",
              match: {
                value: documentId
              }
            }
          ]
        }
      })
    });
  }

  private async ensureCollection(vectorSize: number) {
    if (this.collectionReadyForSize === vectorSize) return;

    const response = await fetch(`${env.qdrantUrl}/collections/${env.qdrantCollection}`);
    if (response.status === 404) {
      await qdrantRequest(`/collections/${env.qdrantCollection}`, {
        method: "PUT",
        body: JSON.stringify({
          vectors: {
            size: vectorSize,
            distance: "Cosine"
          }
        })
      });
      this.collectionReadyForSize = vectorSize;
      return;
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Qdrant collection check failed: ${response.status} ${body}`);
    }

    this.collectionReadyForSize = vectorSize;
  }
}
