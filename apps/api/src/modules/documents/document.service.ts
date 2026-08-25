import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { AppError } from "../../shared/errors/app-error.js";
import { HttpStatus } from "../../shared/constants/http-status.js";
import { vectorStore } from "../../infrastructure/vector-db/vector-store.js";
import { embeddingService } from "../embeddings/embedding.service.js";
import { documentRepository, type DocumentRepository } from "./document.repository.js";
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
  vectorStoreProvider: document.vectorStoreProvider,
  errorMessage: document.errorMessage,
  processingAttempts: document.processingAttempts,
  createdAt: document.createdAt,
  updatedAt: document.updatedAt,
  processedAt: document.processedAt
});

const toDetail = (document: DocumentRecord): DocumentDetail => ({
  ...toSummary(document),
  extractedText: document.extractedText
});

export class DocumentService {
  constructor(private readonly repository: DocumentRepository = documentRepository) {}

  async uploadDocument(file?: Express.Multer.File): Promise<DocumentRecord> {
    if (!file) {
      throw new AppError("A document file is required.", HttpStatus.BAD_REQUEST);
    }

    this.validateFile(file);

    const now = new Date().toISOString();
    const document: DocumentRecord = {
      id: randomUUID(),
      filename: file.originalname,
      mimeType: file.mimetype || "application/octet-stream",
      sizeBytes: file.size,
      status: "uploaded",
      extractedText: "",
      characterCount: 0,
      chunkCount: 0,
      embeddingProvider: null,
      vectorStoreProvider: null,
      errorMessage: null,
      processingAttempts: 0,
      createdAt: now,
      updatedAt: now,
      processedAt: null,
      chunks: []
    };

    this.repository.save(document);

    if (isPdfDocument(file)) {
      return this.markNeedsParser(document.id);
    }

    const extractedText = this.extractText(file);
    return this.processDocument(document.id, extractedText);
  }

  async retryDocument(id: string): Promise<DocumentRecord> {
    const document = this.getDocument(id);
    if (document.status === "needs_parser") {
      throw new AppError("PDF parsing is not implemented for this document yet.", HttpStatus.BAD_REQUEST);
    }

    if (!document.extractedText) {
      throw new AppError("Document has no extracted text to process.", HttpStatus.BAD_REQUEST);
    }

    return this.processDocument(document.id, document.extractedText);
  }

  async deleteDocument(id: string) {
    this.getDocument(id);
    await vectorStore.deleteByDocumentId(id);
    this.repository.delete(id);
  }

  listDocuments(): DocumentSummary[] {
    return this.repository
      .list()
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map(toSummary);
  }

  getDocument(id: string): DocumentRecord {
    const document = this.repository.findById(id);
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

  async searchDocuments(input: { query: string; limit: number; documentId?: string }) {
    const embedding = await embeddingService.embedQuery(input.query);
    return vectorStore.search({
      embedding,
      limit: input.limit,
      documentId: input.documentId
    });
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

  private async processDocument(id: string, extractedText: string): Promise<DocumentRecord> {
    const document = this.getDocument(id);
    const startedAt = new Date().toISOString();

    this.repository.update(id, {
      status: "processing",
      extractedText,
      characterCount: extractedText.length,
      chunks: [],
      chunkCount: 0,
      embeddingProvider: null,
      vectorStoreProvider: null,
      errorMessage: null,
      processingAttempts: document.processingAttempts + 1,
      updatedAt: startedAt,
      processedAt: null
    });

    try {
      if (!extractedText.trim()) {
        throw new AppError("No readable text could be extracted from this document.", HttpStatus.BAD_REQUEST);
      }

      const embeddedChunks = await embeddingService.embedDocumentText(extractedText);
      const completedAt = new Date().toISOString();
      const chunks = embeddedChunks.map((chunk) => ({
        id: randomUUID(),
        documentId: id,
        embeddingProvider: embeddingService.provider,
        createdAt: completedAt,
        ...chunk
      }));
      await vectorStore.upsert(
        chunks.map((chunk) => ({
          id: chunk.id,
          documentId: chunk.documentId,
          filename: document.filename,
          chunkIndex: chunk.index,
          content: chunk.content,
          characterCount: chunk.characterCount,
          tokenEstimate: chunk.tokenEstimate,
          embedding: chunk.embedding,
          embeddingProvider: chunk.embeddingProvider,
          createdAt: chunk.createdAt
        }))
      );

      return this.updateOrThrow(id, {
        status: "ready",
        chunks,
        chunkCount: chunks.length,
        embeddingProvider: chunks.length > 0 ? embeddingService.provider : null,
        vectorStoreProvider: chunks.length > 0 ? vectorStore.provider : null,
        errorMessage: null,
        updatedAt: completedAt,
        processedAt: completedAt
      });
    } catch (error) {
      const failedAt = new Date().toISOString();
      const message = error instanceof Error ? error.message : "Document processing failed.";

      return this.updateOrThrow(id, {
        status: "failed",
        chunks: [],
        chunkCount: 0,
        embeddingProvider: null,
        vectorStoreProvider: null,
        errorMessage: message,
        updatedAt: failedAt,
        processedAt: failedAt
      });
    }
  }

  private markNeedsParser(id: string) {
    const now = new Date().toISOString();
    return this.updateOrThrow(id, {
      status: "needs_parser",
      errorMessage: "PDF extraction is not implemented yet.",
      updatedAt: now
    });
  }

  private updateOrThrow(id: string, patch: Partial<DocumentRecord>) {
    const document = this.repository.update(id, patch);
    if (!document) {
      throw new AppError("Document not found.", HttpStatus.NOT_FOUND);
    }

    return document;
  }
}

export const documentService = new DocumentService();
