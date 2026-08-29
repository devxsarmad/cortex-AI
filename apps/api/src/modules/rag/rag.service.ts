import { vectorStore } from "../../infrastructure/vector-db/vector-store.js";
import { documentService } from "../documents/document.service.js";
import { buildRagSystemPrompt } from "../chat/chat.prompt.js";
import type { RagSource, RetrieveSourcesInput } from "./rag.types.js";
import type { ToolExecution } from "../tools/tool.types.js";

const MIN_RAG_SCORE = 0.2;
const RAG_SOURCE_LIMIT = 4;
const RAG_CANDIDATE_LIMIT = 12;
const MAX_SOURCES_PER_DOCUMENT = 2;

const toRagSources = (results: Awaited<ReturnType<typeof documentService.searchDocuments>>): RagSource[] => {
  const sourceCounts = new Map<string, number>();
  const sources: RagSource[] = [];

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

export class RagService {
  get vectorStoreProvider() {
    return vectorStore.provider;
  }

  async retrieveSources(input: RetrieveSourcesInput) {
    const results = await documentService.searchDocuments({
      query: input.query,
      limit: RAG_CANDIDATE_LIMIT,
      documentIds: input.documentIds
    });

    return toRagSources(results);
  }

  async buildSystemPrompt(sources: RagSource[], toolResults: ToolExecution[] = []) {
    return buildRagSystemPrompt(sources, toolResults);
  }
}

export const ragService = new RagService();
