import { agentWorkflow } from "./agent.workflow.js";
import type { AgentRunInput, AgentRunResult } from "./agent.types.js";

export class AgentService {
  async run(input: AgentRunInput): Promise<AgentRunResult> {
    const result = await agentWorkflow.invoke(input);

    return {
      route: result.route,
      retrievalPlan: result.retrievalPlan,
      sources: result.sources,
      tools: result.tools,
      systemPrompt: result.systemPrompt,
      trace: result.trace
    };
  }
}

export const agentService = new AgentService();
