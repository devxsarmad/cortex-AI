import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import {
  createConversation,
  deleteConversation,
  getConversation,
  listConversations,
  updateConversationMessages
} from "./conversation.controller.js";

export const conversationRouter = Router();

conversationRouter.get("/", asyncHandler(listConversations));
conversationRouter.post("/", asyncHandler(createConversation));
conversationRouter.get("/:id", asyncHandler(getConversation));
conversationRouter.put("/:id/messages", asyncHandler(updateConversationMessages));
conversationRouter.delete("/:id", asyncHandler(deleteConversation));
