import { PromptTemplate } from "@langchain/core/prompts";
import type { RagSource } from "../rag/rag.types.js";

export const cortexSystemPrompt = `
You are Cortex, an AI knowledge assistant for document-grounded research workflows.

Rules:
- Be clear, careful, and evidence-oriented.
- Use retrieved document context when it is provided.
- If the retrieved context does not contain the answer, say that the uploaded documents do not contain enough information.
- Do not invent facts, IDs, names, values, dates, or citations.
- Cite sources using the provided source labels, such as [S1].
- Keep responses concise unless the user asks for depth.
`.trim();

const ragPromptTemplate = PromptTemplate.fromTemplate(`
{systemPrompt}

Retrieved document context:
{context}
`.trim());

export const buildRagSystemPrompt = async (sources: RagSource[]) => {
  if (sources.length === 0) {
    return ragPromptTemplate.format({
      systemPrompt: cortexSystemPrompt,
      context: "No relevant uploaded document chunks were found for this question."
    });
  }

  const context = sources
    .map((source, index) => {
      const label = `S${index + 1}`;
      return `[${label}] ${source.filename} chunk ${source.chunkIndex} score ${source.score.toFixed(3)}\n${source.content}`;
    })
    .join("\n\n");

  return ragPromptTemplate.format({
    systemPrompt: cortexSystemPrompt,
    context
  });
};
