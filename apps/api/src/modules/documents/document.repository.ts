import type { Prisma } from "@prisma/client";
import { prisma } from "../../infrastructure/database/prisma.js";
import type { DocumentRecord } from "./document.types.js";

export interface DocumentRepository {
  save(document: DocumentRecord): Promise<DocumentRecord>;
  list(organizationId: string): Promise<DocumentRecord[]>;
  listAll(): Promise<DocumentRecord[]>;
  findById(id: string, organizationId?: string): Promise<DocumentRecord | undefined>;
  update(id: string, organizationId: string, patch: Partial<DocumentRecord>): Promise<DocumentRecord | undefined>;
  delete(id: string, organizationId: string): Promise<boolean>;
}

const toRecord = (document: Awaited<ReturnType<typeof prisma.document.findFirst>>): DocumentRecord | undefined =>
  document ? {
    id: document.id, organizationId: document.organizationId, createdById: document.createdById,
    filename: document.filename, mimeType: document.mimeType, sizeBytes: document.sizeBytes,
    status: document.status as DocumentRecord["status"], extractedText: document.extractedText,
    characterCount: document.characterCount, chunkCount: document.chunkCount,
    embeddingProvider: document.embeddingProvider as DocumentRecord["embeddingProvider"],
    vectorStoreProvider: document.vectorStoreProvider as DocumentRecord["vectorStoreProvider"],
    errorMessage: document.errorMessage, processingAttempts: document.processingAttempts,
    chunks: document.chunks as DocumentRecord["chunks"], createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(), processedAt: document.processedAt?.toISOString() ?? null
  } : undefined;

const toData = (document: DocumentRecord): Prisma.DocumentUncheckedCreateInput => ({
  ...document, chunks: document.chunks as unknown as Prisma.InputJsonValue,
  createdAt: new Date(document.createdAt), updatedAt: new Date(document.updatedAt),
  processedAt: document.processedAt ? new Date(document.processedAt) : null
});

export class PrismaDocumentRepository implements DocumentRepository {
  async save(document: DocumentRecord) { return toRecord(await prisma.document.create({ data: toData(document) }))!; }
  async list(organizationId: string) { return (await prisma.document.findMany({ where: { organizationId } })).map((item) => toRecord(item)!); }
  async listAll() { return (await prisma.document.findMany()).map((item) => toRecord(item)!); }
  async findById(id: string, organizationId?: string) {
    return toRecord(await prisma.document.findFirst({ where: { id, ...(organizationId ? { organizationId } : {}) } }));
  }
  async update(id: string, organizationId: string, patch: Partial<DocumentRecord>) {
    const existing = await this.findById(id, organizationId);
    if (!existing) return undefined;
    return toRecord(await prisma.document.update({ where: { id }, data: toData({ ...existing, ...patch }) }))!;
  }
  async delete(id: string, organizationId: string) {
    return (await prisma.document.deleteMany({ where: { id, organizationId } })).count > 0;
  }
}

export const documentRepository = new PrismaDocumentRepository();
