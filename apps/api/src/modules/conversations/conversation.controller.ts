import type { RequestHandler } from "express";
import { HttpStatus } from "../../shared/constants/http-status.js";
import { conversationService } from "./conversation.service.js";
import {
  conversationIdSchema,
  createConversationSchema,
  updateConversationMessagesSchema
} from "./conversation.validation.js";

export const createConversation: RequestHandler = (request, response) => {
  const input = createConversationSchema.parse(request.body);
  const conversation = conversationService.createConversation(input);

  response.status(HttpStatus.CREATED).json({
    conversation
  });
};

export const listConversations: RequestHandler = (_request, response) => {
  response.json({
    conversations: conversationService.listConversations()
  });
};

export const getConversation: RequestHandler = (request, response) => {
  const { id } = conversationIdSchema.parse(request.params);

  response.json({
    conversation: conversationService.getConversation(id)
  });
};

export const updateConversationMessages: RequestHandler = (request, response) => {
  const { id } = conversationIdSchema.parse(request.params);
  const input = updateConversationMessagesSchema.parse(request.body);

  response.json({
    conversation: conversationService.updateMessages(id, input)
  });
};

export const deleteConversation: RequestHandler = (request, response) => {
  const { id } = conversationIdSchema.parse(request.params);
  conversationService.deleteConversation(id);

  response.json({
    conversationId: id
  });
};
