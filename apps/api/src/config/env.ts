import "dotenv/config";
import { z } from "zod";

const DEVELOPMENT_JWT_SECRET = "development-access-secret-change-me-now";

const optionalNumber = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().optional(),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:3001"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  OPENAI_EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  OPENAI_TIMEOUT_MS: z.string().optional(),
  OPENAI_MAX_RETRIES: z.string().optional(),
  AI_TEMPERATURE: z.string().optional(),
  CORTEX_API_KEY: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().optional(),
  RATE_LIMIT_MAX_REQUESTS: z.string().optional(),
  AI_INPUT_COST_PER_1K_TOKENS: z.string().optional(),
  AI_OUTPUT_COST_PER_1K_TOKENS: z.string().optional(),
  CORTEX_DATA_DIR: z.string().default(".cortex-data"),
  DATABASE_URL: z.string().min(1).default("postgresql://cortex:cortex@localhost:5432/cortex?schema=public"),
  DIRECT_URL: z.string().min(1).optional(),
  JWT_ACCESS_SECRET: z.string().min(32).default(DEVELOPMENT_JWT_SECRET),
  JWT_ACCESS_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.string().optional(),
  AUTH_RATE_LIMIT_MAX_REQUESTS: z.string().optional(),
  VECTOR_STORE_PROVIDER: z.enum(["memory", "qdrant"]).default("memory"),
  QDRANT_URL: z.string().url().default("http://localhost:6333"),
  QDRANT_COLLECTION: z.string().default("cortex_chunks")
});

const parsedEnv = envSchema.parse(process.env);

if (parsedEnv.NODE_ENV === "production" && parsedEnv.JWT_ACCESS_SECRET === DEVELOPMENT_JWT_SECRET) {
  throw new Error("JWT_ACCESS_SECRET must be set to a unique value in production.");
}

export const env = {
  nodeEnv: parsedEnv.NODE_ENV,
  port: optionalNumber(parsedEnv.PORT, 4000),
  clientOrigin: parsedEnv.CLIENT_ORIGIN,
  openaiApiKey: parsedEnv.OPENAI_API_KEY,
  openaiModel: parsedEnv.OPENAI_MODEL,
  openaiEmbeddingModel: parsedEnv.OPENAI_EMBEDDING_MODEL,
  openaiTimeoutMs: optionalNumber(parsedEnv.OPENAI_TIMEOUT_MS, 30_000),
  openaiMaxRetries: Math.max(0, Math.floor(optionalNumber(parsedEnv.OPENAI_MAX_RETRIES, 5))),
  aiTemperature: optionalNumber(parsedEnv.AI_TEMPERATURE, 0.3),
  cortexApiKey: parsedEnv.CORTEX_API_KEY,
  rateLimitWindowMs: optionalNumber(parsedEnv.RATE_LIMIT_WINDOW_MS, 60_000),
  rateLimitMaxRequests: optionalNumber(parsedEnv.RATE_LIMIT_MAX_REQUESTS, 120),
  aiInputCostPer1kTokens: optionalNumber(parsedEnv.AI_INPUT_COST_PER_1K_TOKENS, 0),
  aiOutputCostPer1kTokens: optionalNumber(parsedEnv.AI_OUTPUT_COST_PER_1K_TOKENS, 0),
  cortexDataDir: parsedEnv.CORTEX_DATA_DIR,
  databaseUrl: parsedEnv.DATABASE_URL,
  jwtAccessSecret: parsedEnv.JWT_ACCESS_SECRET,
  jwtAccessTtl: parsedEnv.JWT_ACCESS_TTL,
  refreshTokenTtlDays: optionalNumber(parsedEnv.REFRESH_TOKEN_TTL_DAYS, 30),
  authRateLimitMaxRequests: optionalNumber(parsedEnv.AUTH_RATE_LIMIT_MAX_REQUESTS, 10),
  vectorStoreProvider: parsedEnv.VECTOR_STORE_PROVIDER,
  qdrantUrl: parsedEnv.QDRANT_URL.replace(/\/$/, ""),
  qdrantCollection: parsedEnv.QDRANT_COLLECTION
};
