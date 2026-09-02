import type {
  DocumentChunk,
  DocumentDetail,
  DocumentSummary
} from "@/features/documents/types/document.types";
import { API_URL, createApiHeaders } from "./api-client";

type UploadDocumentResponse = {
  document: DocumentDetail;
};

type ListDocumentsResponse = {
  documents: DocumentSummary[];
};

type ListDocumentChunksResponse = {
  chunks: DocumentChunk[];
};

type DeleteDocumentResponse = {
  documentId: string;
};

export const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/documents`, {
    method: "POST",
    headers: createApiHeaders(),
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
  const response = await fetch(`${API_URL}/api/documents`, {
    headers: createApiHeaders()
  });

  if (!response.ok) {
    throw new Error("Could not load documents.");
  }

  const payload = (await response.json()) as ListDocumentsResponse;
  return payload.documents;
};

export const listDocumentChunks = async (documentId: string) => {
  const response = await fetch(`${API_URL}/api/documents/${documentId}/chunks`, {
    headers: createApiHeaders()
  });

  if (!response.ok) {
    throw new Error("Could not load document chunks.");
  }

  const payload = (await response.json()) as ListDocumentChunksResponse;
  return payload.chunks;
};

export const retryDocument = async (documentId: string) => {
  const response = await fetch(`${API_URL}/api/documents/${documentId}/retry`, {
    method: "POST",
    headers: createApiHeaders()
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? "Could not retry document processing.");
  }

  const payload = (await response.json()) as UploadDocumentResponse;
  return payload.document;
};

export const deleteDocument = async (documentId: string) => {
  const response = await fetch(`${API_URL}/api/documents/${documentId}`, {
    method: "DELETE",
    headers: createApiHeaders()
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? "Could not remove document.");
  }

  const payload = (await response.json()) as DeleteDocumentResponse;
  return payload.documentId;
};
