import type { RequestHandler } from "express";
import { HttpStatus } from "../../shared/constants/http-status.js";
import { getRequestOwnerId } from "../../shared/request/request-owner.js";
import { conversationService } from "./conversation.service.js";
import {
  conversationIdSchema,
  createConversationSchema,
  updateConversationMessagesSchema
} from "./conversation.validation.js";

export const createConversation: RequestHandler = (request, response) => {
  const input = createConversationSchema.parse(request.body);
  const conversation = conversationService.createConversation(input, getRequestOwnerId(request));

  response.status(HttpStatus.CREATED).json({
    conversation
  });
};

export const listConversations: RequestHandler = (request, response) => {
  response.json({
    conversations: conversationService.listConversations(getRequestOwnerId(request))
  });
};

export const getConversation: RequestHandler = (request, response) => {
  const { id } = conversationIdSchema.parse(request.params);

  response.json({
    conversation: conversationService.getConversation(id, getRequestOwnerId(request))
  });
};

export const updateConversationMessages: RequestHandler = (request, response) => {
  const { id } = conversationIdSchema.parse(request.params);
  const input = updateConversationMessagesSchema.parse(request.body);

  response.json({
    conversation: conversationService.updateMessages(id, input, getRequestOwnerId(request))
  });
};

export const deleteConversation: RequestHandler = (request, response) => {
  const { id } = conversationIdSchema.parse(request.params);
  conversationService.deleteConversation(id, getRequestOwnerId(request));

  response.json({
    conversationId: id
  });
};
