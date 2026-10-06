import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { AppError } from "../../shared/errors/app-error.js";
import { HttpStatus } from "../../shared/constants/http-status.js";
import { vectorStore } from "../../infrastructure/vector-db/vector-store.js";
import { embeddingService } from "../embeddings/embedding.service.js";
import { documentRepository, type DocumentRepository } from "./document.repository.js";
import type { DocumentDetail, DocumentRecord, DocumentSummary } from "./document.types.js";
import { extractPdfText } from "./pdf-extractor.js";

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

const isCsvDocument = (document: Pick<DocumentRecord, "filename" | "mimeType">) => {
  return document.mimeType === "text/csv" || extname(document.filename).toLowerCase() === ".csv";
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
  constructor(private readonly repository: DocumentRepository = documentRepository) {
    void this.restorePersistedVectors();
  }

  async uploadDocument(file: Express.Multer.File | undefined, ownerId: string): Promise<DocumentRecord> {
    if (!file) {
      throw new AppError("A document file is required.", HttpStatus.BAD_REQUEST);
    }

    this.validateFile(file);

    const now = new Date().toISOString();
    const document: DocumentRecord = {
      id: randomUUID(),
      ownerId,
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

    try {
      const extractedText = await this.extractText(file);
      return this.processDocument(document.id, extractedText);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Document extraction failed.";
      return this.markFailed(document.id, message);
    }
  }

  async retryDocument(id: string, ownerId: string): Promise<DocumentRecord> {
    const document = this.getDocument(id, ownerId);
    if (document.status === "needs_parser") {
      throw new AppError("This document still needs a parser that Cortex does not support yet.", HttpStatus.BAD_REQUEST);
    }

    if (!document.extractedText) {
      throw new AppError("Document has no extracted text to process.", HttpStatus.BAD_REQUEST);
    }

    return this.processDocument(document.id, document.extractedText);
  }

  async deleteDocument(id: string, ownerId: string) {
    this.getDocument(id, ownerId);
    await vectorStore.deleteByDocumentId(id);
    this.repository.delete(id);
  }

  listDocuments(ownerId: string): DocumentSummary[] {
    return this.repository
      .list()
      .filter((document) => document.ownerId === ownerId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map(toSummary);
  }

  getDocument(id: string, ownerId?: string): DocumentRecord {
    const document = this.repository.findById(id);
    if (!document || (ownerId && document.ownerId !== ownerId)) {
      throw new AppError("Document not found.", HttpStatus.NOT_FOUND);
    }

    return document;
  }

  getDocumentDetail(id: string, ownerId: string): DocumentDetail {
    return toDetail(this.getDocument(id, ownerId));
  }

  listDocumentChunks(id: string, ownerId: string) {
    return this.getDocument(id, ownerId).chunks;
  }

  async searchDocuments(input: {
    ownerId: string;
    query: string;
    limit: number;
    documentId?: string;
    documentIds?: string[];
  }) {
    const requestedIds = new Set(input.documentIds ?? (input.documentId ? [input.documentId] : []));
    const ownedIds = this.repository
      .list()
      .filter((document) => document.ownerId === input.ownerId && document.status === "ready")
      .map((document) => document.id);
    const scopedDocumentIds = requestedIds.size > 0
      ? ownedIds.filter((documentId) => requestedIds.has(documentId))
      : ownedIds;

    if (scopedDocumentIds.length === 0) {
      return [];
    }

    const embedding = await embeddingService.embedQuery(input.query);
    return vectorStore.search({
      embedding,
      limit: input.limit,
      documentIds: scopedDocumentIds
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

  private async extractText(file: Express.Multer.File) {
    if (isTextDocument(file)) {
      return file.buffer.toString("utf8").trim();
    }

    if (isPdfDocument(file)) {
      return extractPdfText(file.buffer);
    }

    throw new AppError(
      "Unsupported document type. Upload a TXT, Markdown, JSON, CSV, or PDF file.",
      HttpStatus.UNSUPPORTED_MEDIA_TYPE
    );
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
        throw new AppError(
          "No readable text could be extracted from this document. Scanned or image-only PDFs are not supported yet.",
          HttpStatus.BAD_REQUEST
        );
      }

      const embeddedChunks = await embeddingService.embedDocumentText(extractedText, {
        documentFormat: isCsvDocument(document) ? "csv" : "text"
      });
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

  private markFailed(id: string, errorMessage: string) {
    const now = new Date().toISOString();
    return this.updateOrThrow(id, {
      status: "failed",
      errorMessage,
      updatedAt: now,
      processedAt: now
    });
  }

  private updateOrThrow(id: string, patch: Partial<DocumentRecord>) {
    const document = this.repository.update(id, patch);
    if (!document) {
      throw new AppError("Document not found.", HttpStatus.NOT_FOUND);
    }

    return document;
  }

  private async restorePersistedVectors() {
    const documents = this.repository.list().filter((document) => document.status === "ready");
    const points = documents.flatMap((document) =>
      document.chunks.map((chunk) => ({
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

    if (points.length > 0 && vectorStore.provider === "memory") {
      await vectorStore.upsert(points);
    }
  }
}

export const documentService = new DocumentService();
