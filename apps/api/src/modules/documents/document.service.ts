import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { AppError } from "../../shared/errors/app-error.js";
import { HttpStatus } from "../../shared/constants/http-status.js";
import { embeddingService } from "../embeddings/embedding.service.js";
import type { DocumentDetail, DocumentRecord, DocumentSummary } from "./document.types.js";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const textMimeTypes = new Set([
  "text/plain",
  "text/markdown",
  "application/json",
  "text/csv"
]);

const supportedExtensions = new Set([".txt", ".md", ".markdown", ".json", ".csv", ".pdf"]);

const isTextDocument = (file: Express.Multer.File) => {
  const extension = extname(file.originalname).toLowerCase();
  return textMimeTypes.has(file.mimetype) || [".txt", ".md", ".markdown", ".json", ".csv"].includes(extension);
};

const isPdfDocument = (file: Express.Multer.File) => {
  return file.mimetype === "application/pdf" || extname(file.originalname).toLowerCase() === ".pdf";
};

const toSummary = (document: DocumentRecord): DocumentSummary => ({
  id: document.id,
  filename: document.filename,
  mimeType: document.mimeType,
  sizeBytes: document.sizeBytes,
  status: document.status,
  characterCount: document.characterCount,
  chunkCount: document.chunkCount,
  embeddingProvider: document.embeddingProvider,
  createdAt: document.createdAt
});

const toDetail = (document: DocumentRecord): DocumentDetail => ({
  ...toSummary(document),
  extractedText: document.extractedText
});

export class DocumentService {
  private readonly documents = new Map<string, DocumentRecord>();

  async uploadDocument(file?: Express.Multer.File): Promise<DocumentRecord> {
    if (!file) {
      throw new AppError("A document file is required.", HttpStatus.BAD_REQUEST);
    }

    this.validateFile(file);

    const extractedText = this.extractText(file);
    const status = extractedText ? "ready" : "needs_parser";
    const now = new Date().toISOString();
    const embeddedChunks = status === "ready" ? await embeddingService.embedDocumentText(extractedText) : [];
    const documentId = randomUUID();
    const chunks = embeddedChunks.map((chunk) => ({
      id: randomUUID(),
      documentId,
      embeddingProvider: embeddingService.provider,
      createdAt: now,
      ...chunk
    }));

    const document: DocumentRecord = {
      id: documentId,
      filename: file.originalname,
      mimeType: file.mimetype || "application/octet-stream",
      sizeBytes: file.size,
      status,
      extractedText,
      characterCount: extractedText.length,
      chunkCount: chunks.length,
      embeddingProvider: chunks.length > 0 ? embeddingService.provider : null,
      createdAt: now,
      chunks
    };

    this.documents.set(document.id, document);
    return document;
  }

  listDocuments(): DocumentSummary[] {
    return [...this.documents.values()]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map(toSummary);
  }

  getDocument(id: string): DocumentRecord {
    const document = this.documents.get(id);
    if (!document) {
      throw new AppError("Document not found.", HttpStatus.NOT_FOUND);
    }

    return document;
  }

  getDocumentDetail(id: string): DocumentDetail {
    return toDetail(this.getDocument(id));
  }

  listDocumentChunks(id: string) {
    return this.getDocument(id).chunks;
  }

  private validateFile(file: Express.Multer.File) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new AppError("Document file must be 5MB or smaller.", HttpStatus.PAYLOAD_TOO_LARGE);
    }

    const extension = extname(file.originalname).toLowerCase();
    if (!supportedExtensions.has(extension)) {
      throw new AppError(
        "Unsupported document type. Upload a TXT, Markdown, JSON, CSV, or PDF file.",
        HttpStatus.UNSUPPORTED_MEDIA_TYPE
      );
    }
  }

  private extractText(file: Express.Multer.File) {
    if (isTextDocument(file)) {
      return file.buffer.toString("utf8").trim();
    }

    if (isPdfDocument(file)) {
      return "";
    }

    return "";
  }
}

export const documentService = new DocumentService();
