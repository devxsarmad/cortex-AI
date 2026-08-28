export type RagSource = {
  id: string;
  documentId: string;
  filename: string;
  chunkIndex: number;
  content: string;
  score: number;
};

export type RetrieveSourcesInput = {
  query: string;
  documentIds?: string[];
};
