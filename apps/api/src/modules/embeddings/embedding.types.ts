export type EmbeddingProvider = "openai" | "mock";

export type TextChunk = {
  index: number;
  content: string;
  characterCount: number;
  tokenEstimate: number;
};

export type EmbeddedChunk = TextChunk & {
  embedding: number[];
};

export interface EmbeddingClient {
  readonly provider: EmbeddingProvider;
  embedTexts(texts: string[]): Promise<number[][]>;
}
