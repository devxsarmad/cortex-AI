import { env } from "../../config/env.js";
import { createLlmClient } from "../../infrastructure/llm/llm.client.js";
import type { LlmClient } from "../../infrastructure/llm/llm.types.js";
import { agentService } from "../agents/agent.service.js";
import { usageService } from "../ops/usage.service.js";
import { ragService } from "../rag/rag.service.js";
import type { ChatStreamMeta, StreamChatRequest } from "./chat.types.js";

const encoder = new TextEncoder();
const MAX_CONTEXT_MESSAGES = 20;

const formatSse = (event: string, data: unknown) => {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
};

const trimContextMessages = (input: StreamChatRequest) => {
  return input.messages.slice(-MAX_CONTEXT_MESSAGES);
};

const estimateTokens = (text: string) => Math.ceil(text.length / 4);

export class ChatService {
  constructor(private readonly llmClient: LlmClient = createLlmClient()) {}

  createChatStream(input: StreamChatRequest) {
    const llmClient = this.llmClient;

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const contextMessages = trimContextMessages(input);
          const agentResult = await agentService.run({
            ...input,
            messages: contextMessages
          });
          const meta: ChatStreamMeta = {
            provider: llmClient.provider,
            memory: {
              totalMessages: input.messages.length,
              contextMessages: contextMessages.length
            },
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
            messages: contextMessages,
            temperature: env.aiTemperature
          });
          let completionTokens = 0;

          for await (const token of completion) {
            completionTokens += estimateTokens(token);
            controller.enqueue(formatSse("token", { token }));
          }

          usageService.recordChatUsage({
            promptTokens: estimateTokens(
              [agentResult.systemPrompt, ...contextMessages.map((message) => message.content)].join("\n")
            ),
            completionTokens
          });

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
