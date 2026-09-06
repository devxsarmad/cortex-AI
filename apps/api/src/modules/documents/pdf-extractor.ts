import { PDFParse } from "pdf-parse";
import { HttpStatus } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/errors/app-error.js";

const normalizePdfText = (text: string) => {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

export const extractPdfText = async (fileBuffer: Buffer) => {
  const parser = new PDFParse({ data: Uint8Array.from(fileBuffer) });

  try {
    const result = await parser.getText({ pageJoiner: "" });
    const pageText = result.pages
      .map((page) => page.text.trim())
      .filter(Boolean)
      .join("\n\n");

    return normalizePdfText(pageText || result.text || "");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown PDF parse error.";
    throw new AppError(`Could not extract text from this PDF. ${message}`, HttpStatus.BAD_REQUEST);
  } finally {
    await parser.destroy();
  }
};
