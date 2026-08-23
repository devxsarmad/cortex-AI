import type { DocumentRecord } from "./document.types.js";

export interface DocumentRepository {
  save(document: DocumentRecord): DocumentRecord;
  list(): DocumentRecord[];
  findById(id: string): DocumentRecord | undefined;
  update(id: string, patch: Partial<DocumentRecord>): DocumentRecord | undefined;
}

export class InMemoryDocumentRepository implements DocumentRepository {
  private readonly documents = new Map<string, DocumentRecord>();

  save(document: DocumentRecord) {
    this.documents.set(document.id, document);
    return document;
  }

  list() {
    return [...this.documents.values()];
  }

  findById(id: string) {
    return this.documents.get(id);
  }

  update(id: string, patch: Partial<DocumentRecord>) {
    const document = this.documents.get(id);
    if (!document) return undefined;

    const nextDocument = {
      ...document,
      ...patch
    };

    this.documents.set(id, nextDocument);
    return nextDocument;
  }
}

export const documentRepository = new InMemoryDocumentRepository();
