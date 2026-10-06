import type { RequestHandler } from "express";
import { HttpStatus } from "../../shared/constants/http-status.js";
import { getRequestOwnerId } from "../../shared/request/request-owner.js";
import { documentIdSchema, searchDocumentsSchema } from "./document.validation.js";
import { documentService } from "./document.service.js";

export const uploadDocument: RequestHandler = async (request, response) => {
  const ownerId = getRequestOwnerId(request);
  const document = await documentService.uploadDocument(request.file, ownerId);

  response.status(HttpStatus.CREATED).json({
    document: documentService.getDocumentDetail(document.id, ownerId)
  });
};

export const listDocuments: RequestHandler = (request, response) => {
  response.json({
    documents: documentService.listDocuments(getRequestOwnerId(request))
  });
};

export const deleteDocument: RequestHandler = async (request, response) => {
  const { id } = documentIdSchema.parse(request.params);
  await documentService.deleteDocument(id, getRequestOwnerId(request));

  response.json({
    documentId: id
  });
};

export const getDocument: RequestHandler = (request, response) => {
  const { id } = documentIdSchema.parse(request.params);
  const document = documentService.getDocumentDetail(id, getRequestOwnerId(request));

  response.json({
    document
  });
};

export const listDocumentChunks: RequestHandler = (request, response) => {
  const { id } = documentIdSchema.parse(request.params);
  const chunks = documentService.listDocumentChunks(id, getRequestOwnerId(request));

  response.json({
    chunks
  });
};

export const retryDocument: RequestHandler = async (request, response) => {
  const { id } = documentIdSchema.parse(request.params);
  const ownerId = getRequestOwnerId(request);
  const document = await documentService.retryDocument(id, ownerId);

  response.json({
    document: documentService.getDocumentDetail(document.id, ownerId)
  });
};

export const searchDocuments: RequestHandler = async (request, response) => {
  const input = searchDocumentsSchema.parse(request.body);
  const results = await documentService.searchDocuments({
    ...input,
    ownerId: getRequestOwnerId(request)
  });

  response.json({
    results
  });
};
