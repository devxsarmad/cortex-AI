import type {
  DocumentChunk,
  DocumentDetail,
  DocumentSummary
} from "@/features/documents/types/document.types";
import { apiRequest } from "./api-client";

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

  const payload = await apiRequest<UploadDocumentResponse>("/api/documents", {
    method: "POST",
    body: formData
  });

  return payload.document;
};

export const listDocuments = async () => {
  const payload = await apiRequest<ListDocumentsResponse>("/api/documents");
  return payload.documents;
};

export const listDocumentChunks = async (documentId: string) => {
  const payload = await apiRequest<ListDocumentChunksResponse>(`/api/documents/${documentId}/chunks`);
  return payload.chunks;
};

export const retryDocument = async (documentId: string) => {
  const payload = await apiRequest<UploadDocumentResponse>(`/api/documents/${documentId}/retry`, { method: "POST" });
  return payload.document;
};

export const deleteDocument = async (documentId: string) => {
  const payload = await apiRequest<DeleteDocumentResponse>(`/api/documents/${documentId}`, { method: "DELETE" });
  return payload.documentId;
};
