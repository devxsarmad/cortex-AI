import { PromptTemplate } from "@langchain/core/prompts";
import type { RagSource } from "../rag/rag.types.js";
import type { ToolExecution } from "../tools/tool.types.js";

export const cortexSystemPrompt = `
You are Cortex, an AI knowledge assistant for document-grounded research workflows.

Rules:
- Be clear, careful, and evidence-oriented.
- Use retrieved document context when it is provided.
- If the retrieved context does not contain the answer, say that the uploaded documents do not contain enough information.
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
      return `[${label}] ${source.filename} chunk ${source.chunkIndex} score ${source.score.toFixed(3)}\n${source.content}`;
    })
    .join("\n\n");
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

export const buildRagSystemPrompt = async (sources: RagSource[], toolResults: ToolExecution[] = []) => {
  return ragPromptTemplate.format({
    systemPrompt: cortexSystemPrompt,
    context: formatSources(sources),
    toolResults: formatToolResults(toolResults)
  });
};
