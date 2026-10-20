import type { RequestHandler } from "express";
import { HttpStatus } from "../../shared/constants/http-status.js";
import { getRequestAuth } from "../../shared/request/request-auth.js";
import { conversationService } from "./conversation.service.js";
import {
  conversationIdSchema,
  createConversationSchema,
  updateConversationMessagesSchema
} from "./conversation.validation.js";
import { env } from "../../config/env.js";

const organizationWide = (role: "OWNER" | "ADMIN" | "MEMBER") =>
  role !== "MEMBER" && env.conversationPrivilegedAccess === "organization";

export const createConversation: RequestHandler = async (request, response) => {
  const input = createConversationSchema.parse(request.body);
  const auth = getRequestAuth(request);
  const conversation = await conversationService.createConversation(input, auth.organizationId, auth.userId);

  response.status(HttpStatus.CREATED).json({
    conversation
  });
};

export const listConversations: RequestHandler = async (request, response) => {
  const auth = getRequestAuth(request);
  response.json({
    conversations: await conversationService.listConversations(auth.organizationId, auth.userId, organizationWide(auth.role))
  });
};

export const getConversation: RequestHandler = async (request, response) => {
  const { id } = conversationIdSchema.parse(request.params);
  const auth = getRequestAuth(request);

  response.json({
    conversation: await conversationService.getConversation(id, auth.organizationId, auth.userId, organizationWide(auth.role))
  });
};

export const updateConversationMessages: RequestHandler = async (request, response) => {
  const { id } = conversationIdSchema.parse(request.params);
  const input = updateConversationMessagesSchema.parse(request.body);
  const auth = getRequestAuth(request);

  response.json({
    conversation: await conversationService.updateMessages(id, input, auth.organizationId, auth.userId, organizationWide(auth.role))
  });
};

export const deleteConversation: RequestHandler = async (request, response) => {
  const { id } = conversationIdSchema.parse(request.params);
  const auth = getRequestAuth(request);
  await conversationService.deleteConversation(id, auth.organizationId, auth.userId, organizationWide(auth.role));

  response.json({
    conversationId: id
  });
};
