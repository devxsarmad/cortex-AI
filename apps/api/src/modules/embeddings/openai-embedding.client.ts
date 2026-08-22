import OpenAI from "openai";
import { env } from "../../config/env.js";
import type { EmbeddingClient } from "./embedding.types.js";

export class OpenAiEmbeddingClient implements EmbeddingClient {
  readonly provider = "openai";

  private readonly client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async embedTexts(texts: string[]) {
    if (texts.length === 0) return [];

    const response = await this.client.embeddings.create({
      model: env.openaiEmbeddingModel,
      input: texts
    });

    return response.data.map((item) => item.embedding);
  }
}
