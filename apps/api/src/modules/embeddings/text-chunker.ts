import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { TextChunk } from "./embedding.types.js";

const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_OVERLAP = 180;

type ChunkTextOptions = {
  chunkSize?: number;
  overlap?: number;
  documentFormat?: "text" | "csv";
};

const normalizeText = (text: string) => {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const estimateTokens = (text: string) => Math.ceil(text.length / 4);

const parseCsvRows = (input: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let isQuoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const nextCharacter = input[index + 1];

    if (character === '"' && isQuoted && nextCharacter === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      isQuoted = !isQuoted;
      continue;
    }

    if (character === "," && !isQuoted) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !isQuoted) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      row.push(cell.trim());
      if (row.some(Boolean)) {
        rows.push(row);
      }
      row = [];
      cell = "";
      continue;
    }

    cell += character;
  }

  row.push(cell.trim());
  if (row.some(Boolean)) {
    rows.push(row);
  }

  return rows;
};

const formatCsvRowChunk = (headers: string[], row: string[], rowNumber: number) => {
  const cells = row
    .map((value, index) => {
      const header = headers[index]?.trim() || `Column ${index + 1}`;
      return `${header}: ${value || "empty"}`;
    })
    .join(" | ");

  return `CSV row ${rowNumber}\n${cells}`;
};

const chunkCsvText = (input: string): TextChunk[] => {
  const rows = parseCsvRows(input.trim());
  if (rows.length === 0) return [];

  const [headers, ...dataRows] = rows;
  const chunks = dataRows.length > 0 ? dataRows : rows;
  const headerRow = dataRows.length > 0 ? headers : [];

  return chunks
    .filter((row) => row.some((cell) => cell.trim().length > 0))
    .map((row, index) => {
      const content = formatCsvRowChunk(headerRow, row, index + 1);

      return {
        index,
        content,
        characterCount: content.length,
        tokenEstimate: estimateTokens(content)
      };
    });
};

export const chunkText = async (
  input: string,
  options: ChunkTextOptions = {}
): Promise<TextChunk[]> => {
  if (options.documentFormat === "csv") {
    return chunkCsvText(input);
  }

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
