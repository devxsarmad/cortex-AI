import { env } from "../../config/env.js";
import type { RecordChatUsageInput, UsageSnapshot } from "./usage.types.js";

const emptySnapshot = (): UsageSnapshot => ({
  chatRequests: 0,
  promptTokens: 0,
  completionTokens: 0,
  estimatedCostUsd: 0,
  updatedAt: null
});

const roundCost = (cost: number) => Math.round(cost * 1_000_000) / 1_000_000;

export class UsageService {
  private snapshot = emptySnapshot();

  recordChatUsage(input: RecordChatUsageInput) {
    const inputCost = (input.promptTokens / 1000) * env.aiInputCostPer1kTokens;
    const outputCost = (input.completionTokens / 1000) * env.aiOutputCostPer1kTokens;

    this.snapshot = {
      chatRequests: this.snapshot.chatRequests + 1,
      promptTokens: this.snapshot.promptTokens + input.promptTokens,
      completionTokens: this.snapshot.completionTokens + input.completionTokens,
      estimatedCostUsd: roundCost(this.snapshot.estimatedCostUsd + inputCost + outputCost),
      updatedAt: new Date().toISOString()
    };

    return this.getSnapshot();
  }

  getSnapshot() {
    return { ...this.snapshot };
  }

  reset() {
    this.snapshot = emptySnapshot();
    return this.getSnapshot();
  }
}

export const usageService = new UsageService();
