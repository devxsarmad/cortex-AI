import { JsonFileStore } from "../../infrastructure/storage/json-file-store.js";
import { normalizeOwnerId } from "../../shared/request/request-owner.js";
import type { ConversationRecord } from "./conversation.types.js";

export interface ConversationRepository {
  save(conversation: ConversationRecord): ConversationRecord;
  list(): ConversationRecord[];
  findById(id: string): ConversationRecord | undefined;
  update(id: string, patch: Partial<ConversationRecord>): ConversationRecord | undefined;
  delete(id: string): boolean;
}

export class InMemoryConversationRepository implements ConversationRepository {
  private readonly conversations = new Map<string, ConversationRecord>();
  private readonly store = new JsonFileStore<ConversationRecord>("conversations.json");

  constructor() {
    for (const conversation of this.store.readMany()) {
      this.conversations.set(conversation.id, {
        ...conversation,
        ownerId: normalizeOwnerId(conversation.ownerId)
      });
    }
  }

  save(conversation: ConversationRecord) {
    this.conversations.set(conversation.id, conversation);
    this.persist();
    return conversation;
  }

  list() {
    return [...this.conversations.values()];
  }

  findById(id: string) {
    return this.conversations.get(id);
  }

  update(id: string, patch: Partial<ConversationRecord>) {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;

    const nextConversation = {
      ...conversation,
      ...patch
    };

    this.conversations.set(id, nextConversation);
    this.persist();
    return nextConversation;
  }

  delete(id: string) {
    const didDelete = this.conversations.delete(id);
    if (didDelete) {
      this.persist();
    }

    return didDelete;
  }

  private persist() {
    this.store.writeMany(this.list());
  }
}

export const conversationRepository = new InMemoryConversationRepository();
