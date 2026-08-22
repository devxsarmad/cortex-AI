import type { DocumentChunk, DocumentDetail, DocumentSummary } from "@/features/documents/types/document.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type UploadDocumentResponse = {
  document: DocumentDetail;
};

type ListDocumentsResponse = {
  documents: DocumentSummary[];
};

type ListDocumentChunksResponse = {
  chunks: DocumentChunk[];
};

export const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/documents`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? "Document upload failed.");
  }

  const payload = (await response.json()) as UploadDocumentResponse;
  return payload.document;
};

export const listDocuments = async () => {
  const response = await fetch(`${API_URL}/api/documents`);

  if (!response.ok) {
    throw new Error("Could not load documents.");
  }

  const payload = (await response.json()) as ListDocumentsResponse;
  return payload.documents;
};

export const listDocumentChunks = async (documentId: string) => {
  const response = await fetch(`${API_URL}/api/documents/${documentId}/chunks`);

  if (!response.ok) {
    throw new Error("Could not load document chunks.");
  }

  const payload = (await response.json()) as ListDocumentChunksResponse;
  return payload.chunks;
};
