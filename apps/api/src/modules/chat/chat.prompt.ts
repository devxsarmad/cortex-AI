import { PromptTemplate } from "@langchain/core/prompts";
import type { RagSource, RetrievalPlan } from "../rag/rag.types.js";
import type { ToolExecution } from "../tools/tool.types.js";

export const cortexSystemPrompt = `
You are Cortex, an AI knowledge assistant for document-grounded research workflows.

Rules:
- Be clear, careful, and evidence-oriented.
- Use retrieved document context when it is provided.
- If the retrieved context does not contain the answer, say that the uploaded documents do not contain enough information.
- When a retrieval plan requires synthesis, compare and combine the retrieved sources instead of summarizing only the first source.
- Use backend tool results when they are provided.
- Do not invent tool outputs or claim a tool was used when no tool result is present.
- Do not invent facts, IDs, names, values, dates, or citations.
- Cite sources using the provided source labels, such as [S1].
- Keep responses concise unless the user asks for depth.
`.trim();

const ragPromptTemplate = PromptTemplate.fromTemplate(`
{systemPrompt}

Retrieved document context:
{context}

Retrieval plan:
{retrievalPlan}

Backend tool results:
{toolResults}
`.trim());

const formatSources = (sources: RagSource[]) => {
  if (sources.length === 0) {
    return "No relevant uploaded document chunks were found for this question.";
  }

  return sources
    .map((source, index) => {
      const label = `S${index + 1}`;
      const matchedQueries = source.matchedQueries?.length
        ? ` matched queries: ${source.matchedQueries.join(", ")}`
        : "";
      return `[${label}] ${source.filename} chunk ${source.chunkIndex} score ${source.score.toFixed(3)}${matchedQueries}\n${source.content}`;
    })
    .join("\n\n");
};

const formatRetrievalPlan = (retrievalPlan?: RetrievalPlan) => {
  if (!retrievalPlan) {
    return "No retrieval plan was created.";
  }

  const queries = retrievalPlan.queries
    .map((query) => `${query.label}: ${query.query}`)
    .join("\n");

  return `Strategy: ${retrievalPlan.strategy}\nRequires synthesis: ${retrievalPlan.requiresSynthesis}\nNote: ${retrievalPlan.note}\nQueries:\n${queries}`;
};

const formatToolResults = (toolResults: ToolExecution[]) => {
  if (toolResults.length === 0) {
    return "No backend tools were executed for this question.";
  }

  return toolResults
    .map((tool, index) => {
      const payload = tool.status === "success" ? tool.output : { error: tool.errorMessage };
      return `[T${index + 1}] ${tool.label} (${tool.name})\nInput: ${JSON.stringify(tool.input)}\nOutput: ${JSON.stringify(payload)}`;
    })
    .join("\n\n");
};

export const buildRagSystemPrompt = async (
  sources: RagSource[],
  toolResults: ToolExecution[] = [],
  retrievalPlan?: RetrievalPlan
) => {
  return ragPromptTemplate.format({
    systemPrompt: cortexSystemPrompt,
    context: formatSources(sources),
    retrievalPlan: formatRetrievalPlan(retrievalPlan),
    toolResults: formatToolResults(toolResults)
  });
};
