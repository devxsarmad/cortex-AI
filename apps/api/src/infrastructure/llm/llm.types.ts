import type { ChatMessage } from "../../modules/chat/chat.types.js";

export type LlmProvider = "openai" | "gemini" | "mock";

export type StreamCompletionInput = {
  systemPrompt: string;
  messages: ChatMessage[];
  temperature: number;
};

export interface LlmClient {
  readonly provider: LlmProvider;
  streamCompletion(input: StreamCompletionInput): AsyncIterable<string>;
}
