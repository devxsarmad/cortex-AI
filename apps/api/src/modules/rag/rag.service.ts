import { vectorStore } from "../../infrastructure/vector-db/vector-store.js";
import { documentService } from "../documents/document.service.js";
import { buildRagSystemPrompt } from "../chat/chat.prompt.js";
import type { RagSource, RetrievalPlan, RetrieveSourcesForQueriesInput, RetrieveSourcesInput } from "./rag.types.js";
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

  async retrieveSourcesForQueries(input: RetrieveSourcesForQueriesInput) {
    const resultsByQuery = await Promise.all(
      input.plan.queries.map(async (query) => {
        const results = await documentService.searchDocuments({
          query: query.query,
          limit: RAG_CANDIDATE_LIMIT,
          documentIds: input.documentIds
        });

        return {
          query,
          sources: toRagSources(results)
        };
      })
    );

    const sourcesById = new Map<string, RagSource>();

    for (const { query, sources } of resultsByQuery) {
      for (const source of sources) {
        const existing = sourcesById.get(source.id);
        if (!existing) {
          sourcesById.set(source.id, {
            ...source,
            matchedQueries: [query.label]
          });
          continue;
        }

        sourcesById.set(source.id, {
          ...existing,
          score: Math.max(existing.score, source.score),
          matchedQueries: [...new Set([...(existing.matchedQueries ?? []), query.label])]
        });
      }
    }

    return [...sourcesById.values()]
      .sort((left, right) => right.score - left.score)
      .slice(0, RAG_SOURCE_LIMIT);
  }

  async buildSystemPrompt(
    sources: RagSource[],
    toolResults: ToolExecution[] = [],
    retrievalPlan?: RetrievalPlan
  ) {
    return buildRagSystemPrompt(sources, toolResults, retrievalPlan);
  }
}

export const ragService = new RagService();
