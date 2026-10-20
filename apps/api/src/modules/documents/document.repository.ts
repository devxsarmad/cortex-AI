import type { Prisma } from "@prisma/client";
import { systemTenantData, tenantData } from "../../infrastructure/database/tenant-data.js";
import type { DocumentRecord } from "./document.types.js";

export interface DocumentRepository {
  save(document: DocumentRecord): Promise<DocumentRecord>;
  list(organizationId: string): Promise<DocumentRecord[]>;
  listAllTenants(): Promise<DocumentRecord[]>;
  findById(id: string, organizationId: string): Promise<DocumentRecord | undefined>;
  update(id: string, organizationId: string, patch: Partial<DocumentRecord>): Promise<DocumentRecord | undefined>;
  delete(id: string, organizationId: string): Promise<boolean>;
}

type StoredDocument = Prisma.DocumentGetPayload<Record<string, never>>;
const toRecord = (document: StoredDocument | null): DocumentRecord | undefined =>
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

const toData = (document: DocumentRecord): Omit<Prisma.DocumentUncheckedCreateInput, "organizationId"> => {
  const { organizationId: _organizationId, ...record } = document;
  void _organizationId;
  return ({
  ...record, chunks: document.chunks as unknown as Prisma.InputJsonValue,
  createdAt: new Date(document.createdAt), updatedAt: new Date(document.updatedAt),
  processedAt: document.processedAt ? new Date(document.processedAt) : null
  });
};

export class PrismaDocumentRepository implements DocumentRepository {
  async save(document: DocumentRecord) { return toRecord(await tenantData(document.organizationId).documents.create(toData(document)))!; }
  async list(organizationId: string) { return (await tenantData(organizationId).documents.list()).map((item) => toRecord(item)!); }
  async listAllTenants() {
    const organizations = await systemTenantData.listOrganizations();
    return (await Promise.all(organizations.map(({ id }) => this.list(id)))).flat();
  }
  async findById(id: string, organizationId: string) {
    return toRecord(await tenantData(organizationId).documents.find(id));
  }
  async update(id: string, organizationId: string, patch: Partial<DocumentRecord>) {
    const existing = await this.findById(id, organizationId);
    if (!existing) return undefined;
    await tenantData(organizationId).documents.update(id, toData({ ...existing, ...patch }));
    return this.findById(id, organizationId);
  }
  async delete(id: string, organizationId: string) {
    return (await tenantData(organizationId).documents.delete(id)).count > 0;
  }
}

export const documentRepository = new PrismaDocumentRepository();
