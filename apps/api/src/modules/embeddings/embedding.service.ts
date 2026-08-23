import { env } from "../../config/env.js";
import { chunkText } from "./text-chunker.js";
import type { EmbeddedChunk, EmbeddingClient } from "./embedding.types.js";
import { MockEmbeddingClient } from "./mock-embedding.client.js";
import { OpenAiEmbeddingClient } from "./openai-embedding.client.js";

export const createEmbeddingClient = (): EmbeddingClient => {
  if (env.openaiApiKey) {
    return new OpenAiEmbeddingClient(env.openaiApiKey);
  }

  return new MockEmbeddingClient();
};

export class EmbeddingService {
  constructor(private readonly embeddingClient: EmbeddingClient = createEmbeddingClient()) {}

  get provider() {
    return this.embeddingClient.provider;
  }

  async embedDocumentText(text: string): Promise<EmbeddedChunk[]> {
    const chunks = chunkText(text);
    const vectors = await this.embeddingClient.embedTexts(chunks.map((chunk) => chunk.content));

    return chunks.map((chunk, index) => ({
      ...chunk,
      embedding: vectors[index] ?? []
    }));
  }

  async embedQuery(text: string) {
    const [embedding] = await this.embeddingClient.embedTexts([text]);
    return embedding ?? [];
  }
}

export const embeddingService = new EmbeddingService();
