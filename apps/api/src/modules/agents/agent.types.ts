import type { ChatMessage } from "../chat/chat.types.js";
import type { RagSource } from "../rag/rag.types.js";
import type { PlannedToolCall } from "../tools/tool.service.js";
import type { ToolExecution } from "../tools/tool.types.js";

export type AgentRoute = "respond" | "retrieve" | "tools" | "retrieve_and_tools";

export type AgentTraceStep = {
  node: "route" | "retrieve" | "tools" | "prompt";
  message: string;
  createdAt: string;
};

export type AgentRunInput = {
  messages: ChatMessage[];
  documentIds?: string[];
};

export type AgentRunResult = {
  route: AgentRoute;
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
  sources: RagSource[];
  tools: ToolExecution[];
  systemPrompt: string;
  trace: AgentTraceStep[];
};
