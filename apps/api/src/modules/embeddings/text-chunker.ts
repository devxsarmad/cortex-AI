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

const findBreakPoint = (text: string, targetEnd: number, minEnd: number) => {
  const paragraphBreak = text.lastIndexOf("\n\n", targetEnd);
  if (paragraphBreak >= minEnd) return paragraphBreak + 2;

  const sentenceBreak = Math.max(
    text.lastIndexOf(". ", targetEnd),
    text.lastIndexOf("? ", targetEnd),
    text.lastIndexOf("! ", targetEnd)
  );
  if (sentenceBreak >= minEnd) return sentenceBreak + 2;

  const wordBreak = text.lastIndexOf(" ", targetEnd);
  if (wordBreak >= minEnd) return wordBreak + 1;

  return targetEnd;
};

export const chunkText = (
  input: string,
  options: { chunkSize?: number; overlap?: number } = {}
): TextChunk[] => {
  const text = normalizeText(input);
  if (!text) return [];

  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const overlap = options.overlap ?? DEFAULT_OVERLAP;
  const chunks: TextChunk[] = [];

  let cursor = 0;
  while (cursor < text.length) {
    const targetEnd = Math.min(cursor + chunkSize, text.length);
    const minEnd = Math.min(cursor + Math.floor(chunkSize * 0.55), targetEnd);
    const end = targetEnd === text.length ? targetEnd : findBreakPoint(text, targetEnd, minEnd);
    const content = text.slice(cursor, end).trim();

    if (content) {
      chunks.push({
        index: chunks.length,
        content,
        characterCount: content.length,
        tokenEstimate: estimateTokens(content)
      });
    }

    if (end >= text.length) break;
    cursor = Math.max(0, end - overlap);
  }

  return chunks;
};
