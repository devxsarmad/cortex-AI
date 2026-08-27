import { env } from "../../config/env.js";
import { createLlmClient } from "../../infrastructure/llm/llm.client.js";
import type { LlmClient } from "../../infrastructure/llm/llm.types.js";
import { vectorStore } from "../../infrastructure/vector-db/vector-store.js";
import { documentService } from "../documents/document.service.js";
import { buildRagSystemPrompt } from "./chat.prompt.js";
import type { ChatSource, ChatStreamMeta, StreamChatRequest } from "./chat.types.js";

const encoder = new TextEncoder();

const formatSse = (event: string, data: unknown) => {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
};

const MIN_RAG_SCORE = 0.2;
const RAG_SOURCE_LIMIT = 4;
const RAG_CANDIDATE_LIMIT = 12;
const MAX_SOURCES_PER_DOCUMENT = 2;

const getLatestUserMessage = (input: StreamChatRequest) => {
  return [...input.messages].reverse().find((message) => message.role === "user");
};

const shouldRetrieve = (input: StreamChatRequest) => {
  return !input.documentIds || input.documentIds.length > 0;
};

const toChatSources = (results: Awaited<ReturnType<typeof documentService.searchDocuments>>): ChatSource[] => {
  const sourceCounts = new Map<string, number>();
  const sources: ChatSource[] = [];

  for (const result of results) {
    if (result.score < MIN_RAG_SCORE) continue;

    const currentCount = sourceCounts.get(result.documentId) ?? 0;
    if (currentCount >= MAX_SOURCES_PER_DOCUMENT) continue;

    sourceCounts.set(result.documentId, currentCount + 1);
    sources.push({
      id: result.id,
      documentId: result.documentId,
      filename: result.filename,
      chunkIndex: result.chunkIndex,
      content: result.content,
      score: result.score
    });

    if (sources.length >= RAG_SOURCE_LIMIT) break;
  }

  return sources;
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
            ? toChatSources(
                await documentService.searchDocuments({
                  query: latestUserMessage.content,
                  limit: RAG_CANDIDATE_LIMIT,
                  documentIds: input.documentIds
                })
              )
            : [];
          const meta: ChatStreamMeta = {
            provider: llmClient.provider,
            retrieval: {
              sourceCount: sources.length,
              scopedDocumentCount: input.documentIds?.length ?? 0,
              vectorStoreProvider: vectorStore.provider
            }
          };
          controller.enqueue(formatSse("meta", meta));
          controller.enqueue(formatSse("sources", { sources }));

          const completion = llmClient.streamCompletion({
            systemPrompt: buildRagSystemPrompt(sources),
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
