import { env } from "../../config/env.js";
import type { LlmClient } from "./llm.types.js";
import { MockLlmClient } from "./mock.client.js";
import { OpenAiClient } from "./openai.client.js";

export const createLlmClient = (): LlmClient => {
  if (env.openaiApiKey) {
    return new OpenAiClient(env.openaiApiKey);
  }

  return new MockLlmClient();
};
