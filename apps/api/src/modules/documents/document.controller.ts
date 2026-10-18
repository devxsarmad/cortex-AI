import type { RequestHandler } from "express";
import { HttpStatus } from "../../shared/constants/http-status.js";
import { getRequestAuth } from "../../shared/request/request-auth.js";
import { documentIdSchema, searchDocumentsSchema } from "./document.validation.js";
import { documentService } from "./document.service.js";

export const uploadDocument: RequestHandler = async (request, response) => {
  const auth = getRequestAuth(request);
  const document = await documentService.uploadDocument(request.file, auth.organizationId, auth.userId);

  response.status(HttpStatus.CREATED).json({
    document: await documentService.getDocumentDetail(document.id, auth.organizationId)
  });
};

export const listDocuments: RequestHandler = async (request, response) => {
  response.json({
    documents: await documentService.listDocuments(getRequestAuth(request).organizationId)
  });
};

export const deleteDocument: RequestHandler = async (request, response) => {
  const { id } = documentIdSchema.parse(request.params);
  await documentService.deleteDocument(id, getRequestAuth(request).organizationId);

  response.json({
    documentId: id
  });
};

export const getDocument: RequestHandler = async (request, response) => {
  const { id } = documentIdSchema.parse(request.params);
  const document = await documentService.getDocumentDetail(id, getRequestAuth(request).organizationId);

  response.json({
    document
  });
};

export const listDocumentChunks: RequestHandler = async (request, response) => {
  const { id } = documentIdSchema.parse(request.params);
  const chunks = await documentService.listDocumentChunks(id, getRequestAuth(request).organizationId);

  response.json({
    chunks
  });
};

export const retryDocument: RequestHandler = async (request, response) => {
  const { id } = documentIdSchema.parse(request.params);
  const organizationId = getRequestAuth(request).organizationId;
  const document = await documentService.retryDocument(id, organizationId);

  response.json({
    document: await documentService.getDocumentDetail(document.id, organizationId)
  });
};

export const searchDocuments: RequestHandler = async (request, response) => {
  const input = searchDocumentsSchema.parse(request.body);
  const results = await documentService.searchDocuments({
    ...input,
    organizationId: getRequestAuth(request).organizationId
  });

  response.json({
    results
  });
};
