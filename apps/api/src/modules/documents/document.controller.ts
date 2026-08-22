import type { RequestHandler } from "express";
import { HttpStatus } from "../../shared/constants/http-status.js";
import { documentIdSchema } from "./document.validation.js";
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
