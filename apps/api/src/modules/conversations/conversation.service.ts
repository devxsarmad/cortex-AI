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

const createTitleFromMessages = (messages: ChatMessage[]) => {
  const firstUserMessage = messages.find((message) => message.role === "user")?.content.trim();
  if (!firstUserMessage) return DEFAULT_TITLE;

  return firstUserMessage.length > TITLE_MAX_LENGTH
    ? `${firstUserMessage.slice(0, TITLE_MAX_LENGTH - 3)}...`
    : firstUserMessage;
};

export class ConversationService {
  constructor(private readonly repository: ConversationRepository = conversationRepository) {}

  createConversation(input: CreateConversationInput = {}): ConversationDetail {
    const now = new Date().toISOString();
    const conversation: ConversationRecord = {
      id: randomUUID(),
      title: input.title?.trim() || DEFAULT_TITLE,
      messages: [],
      documentIds: [],
      messageCount: 0,
      createdAt: now,
      updatedAt: now
    };

    return this.repository.save(conversation);
  }

  listConversations(): ConversationSummary[] {
    return this.repository
      .list()
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map(toSummary);
  }

  getConversation(id: string): ConversationDetail {
    const conversation = this.repository.findById(id);
    if (!conversation) {
      throw new AppError("Conversation not found.", HttpStatus.NOT_FOUND);
    }

    return conversation;
  }

  updateMessages(id: string, input: UpdateConversationMessagesInput): ConversationDetail {
    const conversation = this.getConversation(id);
    const now = new Date().toISOString();
    const messages = input.messages;
    const title = conversation.title === DEFAULT_TITLE ? createTitleFromMessages(messages) : conversation.title;

    return this.updateOrThrow(id, {
      title,
      messages,
      documentIds: input.documentIds ?? conversation.documentIds,
      messageCount: messages.length,
      updatedAt: now
    });
  }

  deleteConversation(id: string) {
    this.getConversation(id);
    this.repository.delete(id);
  }

  private updateOrThrow(id: string, patch: Partial<ConversationRecord>) {
    const conversation = this.repository.update(id, patch);
    if (!conversation) {
      throw new AppError("Conversation not found.", HttpStatus.NOT_FOUND);
    }

    return conversation;
  }
}

export const conversationService = new ConversationService();
