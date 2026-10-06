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

  createConversation(input: CreateConversationInput = {}, ownerId: string): ConversationDetail {
    const now = new Date().toISOString();
    const conversation: ConversationRecord = {
      id: randomUUID(),
      ownerId,
      title: input.title?.trim() || DEFAULT_TITLE,
      messages: [],
      documentIds: [],
      messageCount: 0,
      createdAt: now,
      updatedAt: now
    };

    return toDetail(this.repository.save(conversation));
  }

  listConversations(ownerId: string): ConversationSummary[] {
    return this.repository
      .list()
      .filter((conversation) => conversation.ownerId === ownerId)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map(toSummary);
  }

  getConversation(id: string, ownerId: string): ConversationDetail {
    const conversation = this.repository.findById(id);
    if (!conversation || conversation.ownerId !== ownerId) {
      throw new AppError("Conversation not found.", HttpStatus.NOT_FOUND);
    }

    return toDetail(conversation);
  }

  updateMessages(id: string, input: UpdateConversationMessagesInput, ownerId: string): ConversationDetail {
    const conversation = this.getConversationRecord(id, ownerId);
    const now = new Date().toISOString();
    const messages = input.messages;
    const title = conversation.title === DEFAULT_TITLE ? createTitleFromMessages(messages) : conversation.title;

    return toDetail(this.updateOrThrow(id, ownerId, {
      title,
      messages,
      documentIds: input.documentIds ?? conversation.documentIds,
      messageCount: messages.length,
      updatedAt: now
    }));
  }

  deleteConversation(id: string, ownerId: string) {
    this.getConversationRecord(id, ownerId);
    this.repository.delete(id);
  }

  private getConversationRecord(id: string, ownerId: string) {
    const conversation = this.repository.findById(id);
    if (!conversation || conversation.ownerId !== ownerId) {
      throw new AppError("Conversation not found.", HttpStatus.NOT_FOUND);
    }

    return conversation;
  }

  private updateOrThrow(id: string, ownerId: string, patch: Partial<ConversationRecord>) {
    const conversation = this.repository.update(id, patch);
    if (!conversation || conversation.ownerId !== ownerId) {
      throw new AppError("Conversation not found.", HttpStatus.NOT_FOUND);
    }

    return conversation;
  }
}

export const conversationService = new ConversationService();
