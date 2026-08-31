export type RagSource = {
  id: string;
  documentId: string;
  filename: string;
  chunkIndex: number;
  content: string;
  score: number;
  matchedQueries?: string[];
};

export type RetrievalQuery = {
  id: string;
  label: string;
  query: string;
};

export type RetrievalPlan = {
  strategy: "single_query" | "multi_query" | "comparison";
  queries: RetrievalQuery[];
  requiresSynthesis: boolean;
  note: string;
};

export type RetrieveSourcesInput = {
  query: string;
  documentIds?: string[];
};

export type RetrieveSourcesForQueriesInput = {
  plan: RetrievalPlan;
  documentIds?: string[];
};
