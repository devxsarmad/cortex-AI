import { env } from "../../config/env.js";
import { createLlmClient } from "../../infrastructure/llm/llm.client.js";
import type { LlmClient } from "../../infrastructure/llm/llm.types.js";
import { ragService } from "../rag/rag.service.js";
import { toolService } from "../tools/tool.service.js";
import type { ChatStreamMeta, StreamChatRequest } from "./chat.types.js";

const encoder = new TextEncoder();

const formatSse = (event: string, data: unknown) => {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
};

const getLatestUserMessage = (input: StreamChatRequest) => {
  return [...input.messages].reverse().find((message) => message.role === "user");
};

const shouldRetrieve = (input: StreamChatRequest) => {
  return !input.documentIds || input.documentIds.length > 0;
};

export class ChatService {
  constructor(private readonly llmClient: LlmClient = createLlmClient()) {}

  createChatStream(input: StreamChatRequest) {
    const llmClient = this.llmClient;

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const latestUserMessage = getLatestUserMessage(input);
          const sources = latestUserMessage && shouldRetrieve(input)
            ? await ragService.retrieveSources({
                query: latestUserMessage.content,
                documentIds: input.documentIds
              })
            : [];
          const toolResults = latestUserMessage
            ? await toolService.executePlannedTools(latestUserMessage.content)
            : [];
          const meta: ChatStreamMeta = {
            provider: llmClient.provider,
            retrieval: {
              sourceCount: sources.length,
              scopedDocumentCount: input.documentIds?.length ?? 0,
              vectorStoreProvider: ragService.vectorStoreProvider
            },
            tools: {
              executedCount: toolResults.length
            }
          };
          controller.enqueue(formatSse("meta", meta));
          controller.enqueue(formatSse("sources", { sources }));
          controller.enqueue(formatSse("tools", { tools: toolResults }));

          const completion = llmClient.streamCompletion({
            systemPrompt: await ragService.buildSystemPrompt(sources, toolResults),
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
