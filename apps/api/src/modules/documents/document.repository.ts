import { JsonFileStore } from "../../infrastructure/storage/json-file-store.js";
import type { DocumentRecord } from "./document.types.js";

export interface DocumentRepository {
  save(document: DocumentRecord): DocumentRecord;
  list(): DocumentRecord[];
  findById(id: string): DocumentRecord | undefined;
  update(id: string, patch: Partial<DocumentRecord>): DocumentRecord | undefined;
  delete(id: string): boolean;
}

export class InMemoryDocumentRepository implements DocumentRepository {
  private readonly documents = new Map<string, DocumentRecord>();
  private readonly store = new JsonFileStore<DocumentRecord>("documents.json");

  constructor() {
    for (const document of this.store.readMany()) {
      this.documents.set(document.id, document);
    }
  }

  save(document: DocumentRecord) {
    this.documents.set(document.id, document);
    this.persist();
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
    this.persist();
    return nextDocument;
  }

  delete(id: string) {
    const didDelete = this.documents.delete(id);
    if (didDelete) {
      this.persist();
    }

    return didDelete;
  }

  private persist() {
    this.store.writeMany(this.list());
  }
}

export const documentRepository = new InMemoryDocumentRepository();
