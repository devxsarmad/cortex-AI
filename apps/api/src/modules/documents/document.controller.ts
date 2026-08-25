import type { RequestHandler } from "express";
import { HttpStatus } from "../../shared/constants/http-status.js";
import { documentIdSchema, searchDocumentsSchema } from "./document.validation.js";
import { documentService } from "./document.service.js";

export const uploadDocument: RequestHandler = async (request, response) => {
  const document = await documentService.uploadDocument(request.file);

  response.status(HttpStatus.CREATED).json({
    document: documentService.getDocumentDetail(document.id)
  });
};

export const listDocuments: RequestHandler = (_request, response) => {
  response.json({
    documents: documentService.listDocuments()
  });
};

export const deleteDocument: RequestHandler = async (request, response) => {
  const { id } = documentIdSchema.parse(request.params);
  await documentService.deleteDocument(id);

  response.json({
    documentId: id
  });
};

export const getDocument: RequestHandler = (request, response) => {
  const { id } = documentIdSchema.parse(request.params);
  const document = documentService.getDocumentDetail(id);

  response.json({
    document
  });
};

export const listDocumentChunks: RequestHandler = (request, response) => {
  const { id } = documentIdSchema.parse(request.params);
  const chunks = documentService.listDocumentChunks(id);

  response.json({
    chunks
  });
};

export const retryDocument: RequestHandler = async (request, response) => {
  const { id } = documentIdSchema.parse(request.params);
  const document = await documentService.retryDocument(id);

  response.json({
    document: documentService.getDocumentDetail(document.id)
  });
};

export const searchDocuments: RequestHandler = async (request, response) => {
  const input = searchDocumentsSchema.parse(request.body);
  const results = await documentService.searchDocuments(input);

  response.json({
    results
  });
};
