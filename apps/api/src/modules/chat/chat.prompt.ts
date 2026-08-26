import type { ChatSource } from "./chat.types.js";

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

export const buildRagSystemPrompt = (sources: ChatSource[]) => {
  if (sources.length === 0) {
    return `
${cortexSystemPrompt}

Retrieved document context:
No relevant uploaded document chunks were found for this question.
`.trim();
  }

  const context = sources
    .map((source, index) => {
      const label = `S${index + 1}`;
      return `[${label}] ${source.filename} chunk ${source.chunkIndex} score ${source.score.toFixed(3)}\n${source.content}`;
    })
    .join("\n\n");

  return `
${cortexSystemPrompt}

Retrieved document context:
${context}
`.trim();
};
