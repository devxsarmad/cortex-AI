import type { RequestHandler } from "express";
import { HttpStatus } from "../../shared/constants/http-status.js";
import { getRequestAuth } from "../../shared/request/request-auth.js";
import { conversationService } from "./conversation.service.js";
import {
  conversationIdSchema,
  createConversationSchema,
  updateConversationMessagesSchema
} from "./conversation.validation.js";

export const createConversation: RequestHandler = async (request, response) => {
  const input = createConversationSchema.parse(request.body);
  const auth = getRequestAuth(request);
  const conversation = await conversationService.createConversation(input, auth.organizationId, auth.userId);

  response.status(HttpStatus.CREATED).json({
    conversation
  });
};

export const listConversations: RequestHandler = async (request, response) => {
  response.json({
    conversations: await conversationService.listConversations(getRequestAuth(request).organizationId)
  });
};

export const getConversation: RequestHandler = async (request, response) => {
  const { id } = conversationIdSchema.parse(request.params);

  response.json({
    conversation: await conversationService.getConversation(id, getRequestAuth(request).organizationId)
  });
};

export const updateConversationMessages: RequestHandler = async (request, response) => {
  const { id } = conversationIdSchema.parse(request.params);
  const input = updateConversationMessagesSchema.parse(request.body);

  response.json({
    conversation: await conversationService.updateMessages(id, input, getRequestAuth(request).organizationId)
  });
};

export const deleteConversation: RequestHandler = async (request, response) => {
  const { id } = conversationIdSchema.parse(request.params);
  await conversationService.deleteConversation(id, getRequestAuth(request).organizationId);

  response.json({
    conversationId: id
  });
};
