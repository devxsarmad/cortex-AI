import type { AgentRoute, AgentTraceStep } from "../agents/agent.types.js";
import type { RagSource, RetrievalPlan } from "../rag/rag.types.js";
import type { ToolExecution } from "../tools/tool.types.js";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type StreamChatRequest = {
  messages: ChatMessage[];
  documentIds?: string[];
};

export type ChatSource = RagSource;
export type ChatToolResult = ToolExecution;

export type ChatStreamMeta = {
  provider: string;
  retrieval: {
    sourceCount: number;
    scopedDocumentCount: number;
    vectorStoreProvider: string;
    strategy: RetrievalPlan["strategy"] | "none";
    queryCount: number;
  };
  tools: {
    executedCount: number;
  };
  agent: {
    route: AgentRoute;
    trace: AgentTraceStep[];
  };
};
