import type { EmbeddingClient } from "./embedding.types.js";

const DIMENSIONS = 64;

const hashToken = (token: string) => {
  let hash = 2166136261;
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const normalizeVector = (vector: number[]) => {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (magnitude === 0) return vector;
  return vector.map((value) => Number((value / magnitude).toFixed(8)));
};

export class MockEmbeddingClient implements EmbeddingClient {
  readonly provider = "mock";

  async embedTexts(texts: string[]) {
    return texts.map((text) => {
      const vector = Array.from({ length: DIMENSIONS }, () => 0);
      const tokens = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];

      for (const token of tokens) {
        const hash = hashToken(token);
        const bucket = hash % DIMENSIONS;
        const sign = hash % 2 === 0 ? 1 : -1;
        vector[bucket] += sign;
      }

      return normalizeVector(vector);
    });
  }
}
