import { z } from "zod";

export const documentIdSchema = z.object({
  id: z.string().uuid()
});

export const searchDocumentsSchema = z.object({
  query: z.string().trim().min(1).max(1000),
  limit: z.number().int().min(1).max(20).default(5),
  documentId: z.string().uuid().optional(),
  documentIds: z.array(z.string().uuid()).max(20).optional()
});
