import type { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "../../infrastructure/database/prisma.js";
import type { ChatMessage } from "../chat/chat.types.js";
import type { ConversationRecord } from "./conversation.types.js";

export interface ConversationRepository {
  save(conversation: ConversationRecord): Promise<ConversationRecord>;
  list(organizationId: string): Promise<ConversationRecord[]>;
  findById(id: string, organizationId: string): Promise<ConversationRecord | undefined>;
  update(id: string, organizationId: string, patch: Partial<ConversationRecord>): Promise<ConversationRecord | undefined>;
  delete(id: string, organizationId: string): Promise<boolean>;
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
    return toRecord(await prisma.conversation.create({ data: {
      id: conversation.id, organizationId: conversation.organizationId, createdById: conversation.createdById,
      title: conversation.title, documentIds: conversation.documentIds, messageCount: conversation.messageCount,
      createdAt: new Date(conversation.createdAt), updatedAt: new Date(conversation.updatedAt)
    }, include: includeMessages }))!;
  }
  async list(organizationId: string) {
    return (await prisma.conversation.findMany({ where: { organizationId }, include: includeMessages })).map((item) => toRecord(item)!);
  }
  async findById(id: string, organizationId: string) {
    return toRecord(await prisma.conversation.findFirst({ where: { id, organizationId }, include: includeMessages }));
  }
  async update(id: string, organizationId: string, patch: Partial<ConversationRecord>) {
    const existing = await this.findById(id, organizationId);
    if (!existing) return undefined;
    const next = { ...existing, ...patch };
    return prisma.$transaction(async (tx) => {
      if (patch.messages) await tx.message.deleteMany({ where: { conversationId: id, organizationId } });
      return toRecord(await tx.conversation.update({ where: { id }, data: {
        title: next.title, documentIds: next.documentIds, messageCount: next.messageCount, updatedAt: new Date(next.updatedAt),
        ...(patch.messages ? { messages: { create: next.messages.map((message, position) => ({
          id: randomUUID(), organizationId, createdById: message.role === "user" ? next.createdById : null,
          role: message.role, content: message.content, position,
        })) } } : {})
      }, include: includeMessages }))!;
    });
  }
  async delete(id: string, organizationId: string) {
    return (await prisma.conversation.deleteMany({ where: { id, organizationId } })).count > 0;
  }
}

export const conversationRepository = new PrismaConversationRepository();
