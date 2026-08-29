import { documentService } from "../documents/document.service.js";

export const getDocumentStats = () => {
  const documents = documentService.listDocuments();
  const byStatus = documents.reduce<Record<string, number>>((counts, document) => {
    counts[document.status] = (counts[document.status] ?? 0) + 1;
    return counts;
  }, {});

  return {
    totalDocuments: documents.length,
    readyDocuments: byStatus.ready ?? 0,
    totalChunks: documents.reduce((total, document) => total + document.chunkCount, 0),
    byStatus,
    vectorStores: [...new Set(documents.map((document) => document.vectorStoreProvider).filter(Boolean))],
    embeddingProviders: [...new Set(documents.map((document) => document.embeddingProvider).filter(Boolean))]
  };
};
