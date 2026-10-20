import { randomUUID } from "node:crypto";
import { HttpStatus } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/errors/app-error.js";
import type { ChatMessage } from "../chat/chat.types.js";
import { conversationRepository, type ConversationRepository } from "./conversation.repository.js";
import type {
  ConversationDetail,
  ConversationRecord,
  ConversationSummary,
  CreateConversationInput,
  UpdateConversationMessagesInput
} from "./conversation.types.js";

const DEFAULT_TITLE = "New chat";
const TITLE_MAX_LENGTH = 64;

const toSummary = (conversation: ConversationRecord): ConversationSummary => ({
  id: conversation.id,
  title: conversation.title,
  documentIds: conversation.documentIds,
  messageCount: conversation.messageCount,
  createdAt: conversation.createdAt,
  updatedAt: conversation.updatedAt
});

const toDetail = (conversation: ConversationRecord): ConversationDetail => ({
  id: conversation.id,
  title: conversation.title,
  messages: conversation.messages,
  documentIds: conversation.documentIds,
  messageCount: conversation.messageCount,
  createdAt: conversation.createdAt,
  updatedAt: conversation.updatedAt
});

const createTitleFromMessages = (messages: ChatMessage[]) => {
  const firstUserMessage = messages.find((message) => message.role === "user")?.content.trim();
  if (!firstUserMessage) return DEFAULT_TITLE;

  return firstUserMessage.length > TITLE_MAX_LENGTH
    ? `${firstUserMessage.slice(0, TITLE_MAX_LENGTH - 3)}...`
    : firstUserMessage;
};

export class ConversationService {
  constructor(private readonly repository: ConversationRepository = conversationRepository) {}

  async createConversation(input: CreateConversationInput = {}, organizationId: string, userId: string): Promise<ConversationDetail> {
    const now = new Date().toISOString();
    const conversation: ConversationRecord = {
      id: randomUUID(),
      organizationId,
      createdById: userId,
      title: input.title?.trim() || DEFAULT_TITLE,
      messages: [],
      documentIds: [],
      messageCount: 0,
      createdAt: now,
      updatedAt: now
    };

    return toDetail(await this.repository.save(conversation));
  }

  async listConversations(organizationId: string, userId: string, organizationWide = false): Promise<ConversationSummary[]> {
    return (await this.repository.list(organizationId, organizationWide ? undefined : userId))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map(toSummary);
  }

  async getConversation(id: string, organizationId: string, userId: string, organizationWide = false): Promise<ConversationDetail> {
    const conversation = await this.repository.findById(id, organizationId, organizationWide ? undefined : userId);
    if (!conversation) {
      throw new AppError("Conversation not found.", HttpStatus.NOT_FOUND);
    }

    return toDetail(conversation);
  }

  async updateMessages(id: string, input: UpdateConversationMessagesInput, organizationId: string, userId: string, organizationWide = false): Promise<ConversationDetail> {
    const ownerScope = organizationWide ? undefined : userId;
    const conversation = await this.getConversationRecord(id, organizationId, ownerScope);
    const now = new Date().toISOString();
    const messages = input.messages;
    const title = conversation.title === DEFAULT_TITLE ? createTitleFromMessages(messages) : conversation.title;

    return toDetail(await this.updateOrThrow(id, organizationId, ownerScope, {
      title,
      messages,
      documentIds: input.documentIds ?? conversation.documentIds,
      messageCount: messages.length,
      updatedAt: now
    }));
  }

  async deleteConversation(id: string, organizationId: string, userId: string, organizationWide = false) {
    const ownerScope = organizationWide ? undefined : userId;
    await this.getConversationRecord(id, organizationId, ownerScope);
    await this.repository.delete(id, organizationId, ownerScope);
  }

  private async getConversationRecord(id: string, organizationId: string, createdById?: string) {
    const conversation = await this.repository.findById(id, organizationId, createdById);
    if (!conversation) {
      throw new AppError("Conversation not found.", HttpStatus.NOT_FOUND);
    }

    return conversation;
  }

  private async updateOrThrow(id: string, organizationId: string, createdById: string | undefined, patch: Partial<ConversationRecord>) {
    const conversation = await this.repository.update(id, organizationId, createdById, patch);
    if (!conversation) {
      throw new AppError("Conversation not found.", HttpStatus.NOT_FOUND);
    }

    return conversation;
  }
}

export const conversationService = new ConversationService();
