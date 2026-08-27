import type { VectorPoint, VectorSearchInput, VectorSearchResult, VectorStore } from "./vector-store.types.js";

const cosineSimilarity = (left: number[], right: number[]) => {
  const length = Math.min(left.length, right.length);
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < length; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;
    dot += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }

  const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude);
  return denominator === 0 ? 0 : dot / denominator;
};

const toResult = (point: VectorPoint, score: number): VectorSearchResult => {
  const { embedding: _embedding, ...result } = point;
  void _embedding;

  return {
    ...result,
    score
  };
};

export class MemoryVectorStore implements VectorStore {
  readonly provider = "memory";

  private readonly points = new Map<string, VectorPoint>();

  async upsert(points: VectorPoint[]) {
    for (const point of points) {
      this.points.set(point.id, point);
    }
  }

  async search(input: VectorSearchInput) {
    const documentIds = new Set(input.documentIds ?? (input.documentId ? [input.documentId] : []));

    return [...this.points.values()]
      .filter((point) => documentIds.size === 0 || documentIds.has(point.documentId))
      .map((point) => toResult(point, cosineSimilarity(input.embedding, point.embedding)))
      .sort((left, right) => right.score - left.score)
      .slice(0, input.limit);
  }

  async deleteByDocumentId(documentId: string) {
    for (const [pointId, point] of this.points.entries()) {
      if (point.documentId === documentId) {
        this.points.delete(pointId);
      }
    }
  }
}
