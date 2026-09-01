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

  save(conversation: ConversationRecord) {
    this.conversations.set(conversation.id, conversation);
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
    return nextConversation;
  }

  delete(id: string) {
    return this.conversations.delete(id);
  }
}

export const conversationRepository = new InMemoryConversationRepository();
