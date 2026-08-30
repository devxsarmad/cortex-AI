import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { ragService } from "../rag/rag.service.js";
import { toolService } from "../tools/tool.service.js";
import type { AgentRoute, AgentRunInput, AgentState, AgentTraceStep } from "./agent.types.js";

const AgentStateAnnotation = Annotation.Root({
  messages: Annotation<AgentState["messages"]>({
    value: (_left, right) => right,
    default: () => []
  }),
  documentIds: Annotation<AgentState["documentIds"]>(),
  latestUserMessage: Annotation<AgentState["latestUserMessage"]>(),
  route: Annotation<AgentRoute>({
    value: (_left, right) => right,
    default: () => "respond"
  }),
  toolCalls: Annotation<AgentState["toolCalls"]>({
    value: (_left, right) => right,
    default: () => []
  }),
  sources: Annotation<AgentState["sources"]>({
    value: (_left, right) => right,
    default: () => []
  }),
  tools: Annotation<AgentState["tools"]>({
    value: (_left, right) => right,
    default: () => []
  }),
  systemPrompt: Annotation<string>({
    value: (_left, right) => right,
    default: () => ""
  }),
  trace: Annotation<AgentTraceStep[]>({
    reducer: (left, right) => left.concat(right),
    default: () => []
  })
});

const trace = (node: AgentTraceStep["node"], message: string): AgentTraceStep[] => [
  {
    node,
    message,
    createdAt: new Date().toISOString()
  }
];

const getLatestUserMessage = (input: AgentRunInput) => {
  return [...input.messages].reverse().find((message) => message.role === "user");
};

const shouldRetrieve = (input: AgentRunInput) => {
  return !input.documentIds || input.documentIds.length > 0;
};

const routeNode = async (state: typeof AgentStateAnnotation.State) => {
  const latestUserMessage = getLatestUserMessage(state);
  const toolCalls = latestUserMessage ? toolService.planToolCalls(latestUserMessage.content) : [];
  const needsRetrieval = Boolean(latestUserMessage && shouldRetrieve(state));

  let route: AgentRoute = "respond";
  if (needsRetrieval && toolCalls.length > 0) route = "retrieve_and_tools";
  else if (needsRetrieval) route = "retrieve";
  else if (toolCalls.length > 0) route = "tools";

  return {
    latestUserMessage,
    toolCalls,
    route,
    trace: trace("route", `Selected ${route} route.`)
  };
};

const retrieveNode = async (state: typeof AgentStateAnnotation.State) => {
  const sources = state.latestUserMessage
    ? await ragService.retrieveSources({
        query: state.latestUserMessage.content,
        documentIds: state.documentIds
      })
    : [];

  return {
    sources,
    trace: trace("retrieve", `Retrieved ${sources.length} source chunk(s).`)
  };
};

const toolsNode = async (state: typeof AgentStateAnnotation.State) => {
  const tools = state.latestUserMessage
    ? await toolService.executePlannedTools(state.latestUserMessage.content)
    : [];

  return {
    tools,
    trace: trace("tools", `Executed ${tools.length} backend tool(s).`)
  };
};

const promptNode = async (state: typeof AgentStateAnnotation.State) => {
  const systemPrompt = await ragService.buildSystemPrompt(state.sources, state.tools);

  return {
    systemPrompt,
    trace: trace("prompt", "Built final chat system prompt.")
  };
};

const routeAfterPlanning = (state: typeof AgentStateAnnotation.State) => {
  if (state.route === "retrieve" || state.route === "retrieve_and_tools") return "retrieve";
  if (state.route === "tools") return "tools";
  return "prompt";
};

const routeAfterRetrieval = (state: typeof AgentStateAnnotation.State) => {
  return state.route === "retrieve_and_tools" ? "tools" : "prompt";
};

export const agentWorkflow = new StateGraph(AgentStateAnnotation)
  .addNode("plan_request", routeNode)
  .addNode("retrieve_context", retrieveNode)
  .addNode("execute_tools", toolsNode)
  .addNode("build_prompt", promptNode)
  .addEdge(START, "plan_request")
  .addConditionalEdges("plan_request", routeAfterPlanning, {
    retrieve: "retrieve_context",
    tools: "execute_tools",
    prompt: "build_prompt"
  })
  .addConditionalEdges("retrieve_context", routeAfterRetrieval, {
    tools: "execute_tools",
    prompt: "build_prompt"
  })
  .addEdge("execute_tools", "build_prompt")
  .addEdge("build_prompt", END)
  .compile();
