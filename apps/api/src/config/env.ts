import "dotenv/config";
import { z } from "zod";

const optionalNumber = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().optional(),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:3000"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  OPENAI_EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  AI_TEMPERATURE: z.string().optional(),
  VECTOR_STORE_PROVIDER: z.enum(["memory", "qdrant"]).default("memory"),
  QDRANT_URL: z.string().url().default("http://localhost:6333"),
  QDRANT_COLLECTION: z.string().default("cortex_chunks")
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  nodeEnv: parsedEnv.NODE_ENV,
  port: optionalNumber(parsedEnv.PORT, 4000),
  clientOrigin: parsedEnv.CLIENT_ORIGIN,
  openaiApiKey: parsedEnv.OPENAI_API_KEY,
  openaiModel: parsedEnv.OPENAI_MODEL,
  openaiEmbeddingModel: parsedEnv.OPENAI_EMBEDDING_MODEL,
  aiTemperature: optionalNumber(parsedEnv.AI_TEMPERATURE, 0.3),
  vectorStoreProvider: parsedEnv.VECTOR_STORE_PROVIDER,
  qdrantUrl: parsedEnv.QDRANT_URL.replace(/\/$/, ""),
  qdrantCollection: parsedEnv.QDRANT_COLLECTION
};
