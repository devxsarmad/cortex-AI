import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";

type LegacyDocument = Record<string, unknown> & { id: string; chunks?: unknown[] };
type LegacyConversation = Record<string, unknown> & { id: string; messages?: Array<{ role: string; content: string }> };
const prisma = new PrismaClient();
const dataDir = resolve(process.cwd(), process.env.CORTEX_DATA_DIR ?? ".cortex-data");
const read = <T>(filename: string): T[] => {
  const path = resolve(dataDir, filename);
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) as T[] : [];
};

async function main() {
  const email = (process.env.IMPORT_DEFAULT_EMAIL ?? "owner@cortex.local").toLowerCase();
  const password = process.env.IMPORT_DEFAULT_PASSWORD;
  if (!password || password.length < 8) throw new Error("Set IMPORT_DEFAULT_PASSWORD to at least 8 characters.");
  const organizationName = process.env.IMPORT_DEFAULT_ORGANIZATION ?? "Default Organization";
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({ where: { email }, update: {}, create: { email, name: "Cortex Owner", passwordHash } });
  const existingMembership = await prisma.membership.findFirst({ where: { userId: user.id, role: "OWNER" }, include: { organization: true } });
  const organization = existingMembership?.organization ?? await prisma.organization.create({ data: { name: organizationName, memberships: { create: { userId: user.id, role: "OWNER" } } } });

  for (const item of read<LegacyDocument>("documents.json")) {
    await prisma.document.upsert({ where: { id: item.id }, update: {}, create: {
      id: item.id, organizationId: organization.id, createdById: user.id,
      filename: String(item.filename), mimeType: String(item.mimeType), sizeBytes: Number(item.sizeBytes), status: String(item.status),
      extractedText: String(item.extractedText ?? ""), characterCount: Number(item.characterCount ?? 0), chunkCount: Number(item.chunkCount ?? 0),
      embeddingProvider: item.embeddingProvider ? String(item.embeddingProvider) : null, vectorStoreProvider: item.vectorStoreProvider ? String(item.vectorStoreProvider) : null,
      errorMessage: item.errorMessage ? String(item.errorMessage) : null, processingAttempts: Number(item.processingAttempts ?? 0),
      chunks: (item.chunks ?? []) as Prisma.InputJsonValue, createdAt: new Date(String(item.createdAt)), updatedAt: new Date(String(item.updatedAt)),
      processedAt: item.processedAt ? new Date(String(item.processedAt)) : null
    } });
  }

  for (const item of read<LegacyConversation>("conversations.json")) {
    await prisma.conversation.upsert({ where: { id: item.id }, update: {}, create: {
      id: item.id, organizationId: organization.id, createdById: user.id, title: String(item.title),
      documentIds: Array.isArray(item.documentIds) ? item.documentIds.map(String) : [], messageCount: item.messages?.length ?? 0,
      createdAt: new Date(String(item.createdAt)), updatedAt: new Date(String(item.updatedAt)),
      messages: { create: (item.messages ?? []).map((message, position) => ({
        id: crypto.randomUUID(), organizationId: organization.id, createdById: message.role === "user" ? user.id : null,
        role: message.role, content: message.content, position
      })) }
    } });
  }
  console.log(`Imported JSON data into ${organization.name} (${organization.id}) for ${email}.`);
}

main().finally(() => prisma.$disconnect());
