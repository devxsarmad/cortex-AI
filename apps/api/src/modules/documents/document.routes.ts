import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import {
  deleteDocument,
  getDocument,
  listDocumentChunks,
  listDocuments,
  retryDocument,
  searchDocuments,
  uploadDocument
} from "./document.controller.js";
import { requireRole } from "../../shared/middleware/require-role.js";

export const documentRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  }
});

documentRouter.get("/", asyncHandler(listDocuments));
documentRouter.post("/search", asyncHandler(searchDocuments));
documentRouter.get("/:id/chunks", asyncHandler(listDocumentChunks));
documentRouter.get("/:id", asyncHandler(getDocument));
documentRouter.delete("/:id", requireRole("OWNER", "ADMIN"), asyncHandler(deleteDocument));
documentRouter.post("/:id/retry", requireRole("OWNER", "ADMIN"), asyncHandler(retryDocument));
documentRouter.post("/", requireRole("OWNER", "ADMIN"), upload.single("file"), asyncHandler(uploadDocument));
