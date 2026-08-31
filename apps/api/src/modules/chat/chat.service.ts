import { env } from "../../config/env.js";
import { createLlmClient } from "../../infrastructure/llm/llm.client.js";
import type { LlmClient } from "../../infrastructure/llm/llm.types.js";
import { agentService } from "../agents/agent.service.js";
import { ragService } from "../rag/rag.service.js";
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
          const agentResult = await agentService.run(input);
          const meta: ChatStreamMeta = {
            provider: llmClient.provider,
            retrieval: {
              sourceCount: agentResult.sources.length,
              scopedDocumentCount: input.documentIds?.length ?? 0,
              vectorStoreProvider: ragService.vectorStoreProvider,
              strategy: agentResult.retrievalPlan?.strategy ?? "none",
              queryCount: agentResult.retrievalPlan?.queries.length ?? 0
            },
            tools: {
              executedCount: agentResult.tools.length
            },
            agent: {
              route: agentResult.route,
              trace: agentResult.trace
            }
          };
          controller.enqueue(formatSse("meta", meta));
          controller.enqueue(formatSse("sources", { sources: agentResult.sources }));
          controller.enqueue(formatSse("tools", { tools: agentResult.tools }));

          const completion = llmClient.streamCompletion({
            systemPrompt: agentResult.systemPrompt,
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
