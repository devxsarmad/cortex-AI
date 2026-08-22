import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import { getDocument, listDocumentChunks, listDocuments, uploadDocument } from "./document.controller.js";

export const documentRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  }
});

documentRouter.get("/", asyncHandler(listDocuments));
documentRouter.get("/:id/chunks", asyncHandler(listDocumentChunks));
documentRouter.get("/:id", asyncHandler(getDocument));
documentRouter.post("/", upload.single("file"), asyncHandler(uploadDocument));
