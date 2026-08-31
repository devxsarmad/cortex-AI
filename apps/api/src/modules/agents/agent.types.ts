import type { ChatMessage } from "../chat/chat.types.js";
import type { RagSource, RetrievalPlan } from "../rag/rag.types.js";
import type { PlannedToolCall } from "../tools/tool.service.js";
import type { ToolExecution } from "../tools/tool.types.js";

export type AgentRoute = "respond" | "retrieve" | "tools" | "retrieve_and_tools";

export type AgentTraceStep = {
  node: "route" | "plan" | "retrieve" | "tools" | "prompt";
  message: string;
  createdAt: string;
};

export type AgentRunInput = {
  messages: ChatMessage[];
  documentIds?: string[];
};

export type AgentRunResult = {
  route: AgentRoute;
  retrievalPlan?: RetrievalPlan;
  sources: RagSource[];
  tools: ToolExecution[];
  systemPrompt: string;
  trace: AgentTraceStep[];
};

export type AgentState = {
  messages: ChatMessage[];
  documentIds?: string[];
  latestUserMessage?: ChatMessage;
  route: AgentRoute;
  toolCalls: PlannedToolCall[];
  retrievalPlan?: RetrievalPlan;
  sources: RagSource[];
  tools: ToolExecution[];
  systemPrompt: string;
  trace: AgentTraceStep[];
};
