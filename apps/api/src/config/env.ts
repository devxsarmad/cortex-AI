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
  AI_TEMPERATURE: z.string().optional()
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  nodeEnv: parsedEnv.NODE_ENV,
  port: optionalNumber(parsedEnv.PORT, 8000),
  clientOrigin: parsedEnv.CLIENT_ORIGIN,
  openaiApiKey: parsedEnv.OPENAI_API_KEY,
  openaiModel: parsedEnv.OPENAI_MODEL,
  aiTemperature: optionalNumber(parsedEnv.AI_TEMPERATURE, 0.3)
};
