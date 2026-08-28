import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { TextChunk } from "./embedding.types.js";

const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_OVERLAP = 180;

const normalizeText = (text: string) => {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const estimateTokens = (text: string) => Math.ceil(text.length / 4);

export const chunkText = async (
  input: string,
  options: { chunkSize?: number; overlap?: number } = {}
): Promise<TextChunk[]> => {
  const text = normalizeText(input);
  if (!text) return [];

  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const overlap = options.overlap ?? DEFAULT_OVERLAP;
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap: overlap,
    separators: ["\n\n", "\n", ". ", "? ", "! ", " ", ""]
  });

  const chunks = await splitter.splitText(text);
  return chunks.map((content, index) => ({
    index,
    content,
    characterCount: content.length,
    tokenEstimate: estimateTokens(content)
  }));
};
