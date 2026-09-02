export type UsageSnapshot = {
  chatRequests: number;
  promptTokens: number;
  completionTokens: number;
  estimatedCostUsd: number;
  updatedAt: string | null;
};

export type RecordChatUsageInput = {
  promptTokens: number;
  completionTokens: number;
};
