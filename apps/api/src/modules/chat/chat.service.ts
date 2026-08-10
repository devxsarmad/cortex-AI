import { env } from "../../config/env.js";
import { createLlmClient } from "../../infrastructure/llm/llm.client.js";
import type { LlmClient } from "../../infrastructure/llm/llm.types.js";
import { healthcareSystemPrompt } from "./chat.prompt.js";
import type { ChatStreamMeta, StreamChatRequest } from "./chat.types.js";

const encoder = new TextEncoder();

const formatSse = (event: string, data: unknown) => {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
};

export class ChatService {
  constructor(private readonly llmClient: LlmClient = createLlmClient()) {}

  createChatStream(input: StreamChatRequest) {
    const llmClient = this.llmClient;

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const meta: ChatStreamMeta = { provider: llmClient.provider };
          controller.enqueue(formatSse("meta", meta));

          const completion = llmClient.streamCompletion({
            systemPrompt: healthcareSystemPrompt,
            messages: input.messages,
            temperature: env.aiTemperature
          });

          for await (const token of completion) {
            controller.enqueue(formatSse("token", { token }));
          }

          controller.enqueue(formatSse("done", {}));
          controller.close();
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown streaming error";
          controller.enqueue(formatSse("error", { message }));
          controller.close();
        }
      }
    });
  }
}

export const chatService = new ChatService();
