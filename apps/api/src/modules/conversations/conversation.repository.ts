import type { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "../../infrastructure/database/prisma.js";
import { tenantData } from "../../infrastructure/database/tenant-data.js";
import type { ChatMessage } from "../chat/chat.types.js";
import type { ConversationRecord } from "./conversation.types.js";

export interface ConversationRepository {
  save(conversation: ConversationRecord): Promise<ConversationRecord>;
  list(organizationId: string, createdById?: string): Promise<ConversationRecord[]>;
  findById(id: string, organizationId: string, createdById?: string): Promise<ConversationRecord | undefined>;
  update(id: string, organizationId: string, createdById: string | undefined, patch: Partial<ConversationRecord>): Promise<ConversationRecord | undefined>;
  delete(id: string, organizationId: string, createdById?: string): Promise<boolean>;
}

type ConversationWithMessages = Prisma.ConversationGetPayload<{ include: { messages: true } }>;
const includeMessages = { messages: { orderBy: { position: "asc" as const } } };
const toRecord = (conversation?: ConversationWithMessages | null): ConversationRecord | undefined => conversation ? ({
  id: conversation.id, organizationId: conversation.organizationId, createdById: conversation.createdById,
  title: conversation.title, documentIds: conversation.documentIds, messageCount: conversation.messageCount,
  messages: conversation.messages.map((message) => ({ role: message.role as ChatMessage["role"], content: message.content })),
  createdAt: conversation.createdAt.toISOString(), updatedAt: conversation.updatedAt.toISOString()
}) : undefined;

export class PrismaConversationRepository implements ConversationRepository {
  async save(conversation: ConversationRecord) {
    return toRecord(await tenantData(conversation.organizationId).conversations.create({
      id: conversation.id, createdById: conversation.createdById,
      title: conversation.title, documentIds: conversation.documentIds, messageCount: conversation.messageCount,
      createdAt: new Date(conversation.createdAt), updatedAt: new Date(conversation.updatedAt)
    }, includeMessages) as ConversationWithMessages)!;
  }
  async list(organizationId: string, createdById?: string) {
    return (await tenantData(organizationId).conversations.list(createdById, includeMessages)).map((item) => toRecord(item as ConversationWithMessages)!);
  }
  async findById(id: string, organizationId: string, createdById?: string) {
    return toRecord(await tenantData(organizationId).conversations.find(id, createdById, includeMessages) as ConversationWithMessages | null);
  }
  async update(id: string, organizationId: string, createdById: string | undefined, patch: Partial<ConversationRecord>) {
    const existing = await this.findById(id, organizationId, createdById);
    if (!existing) return undefined;
    const next = { ...existing, ...patch };
    return prisma.$transaction(async (tx) => {
      const scoped = tenantData(organizationId, tx);
      const updated = await scoped.conversations.update(id, createdById, {
        title: next.title, documentIds: next.documentIds, messageCount: next.messageCount, updatedAt: new Date(next.updatedAt)
      });
      if (updated.count === 0) return undefined;
      if (patch.messages) {
        await scoped.messages.deleteForConversation(id);
        await scoped.messages.createMany(next.messages.map((message, position) => ({
          id: randomUUID(), conversationId: id, createdById: message.role === "user" ? next.createdById : null,
          role: message.role, content: message.content, position
        })));
      }
      return toRecord(await scoped.conversations.find(id, createdById, includeMessages) as ConversationWithMessages | null);
    });
  }
  async delete(id: string, organizationId: string, createdById?: string) {
    return (await tenantData(organizationId).conversations.delete(id, createdById)).count > 0;
  }
}

export const conversationRepository = new PrismaConversationRepository();
