import { z } from "zod";
import { chatMessageSchema } from "../chat/chat.validation.js";

export const conversationIdSchema = z.object({
  id: z.string().uuid()
});

export const createConversationSchema = z.object({
  title: z.string().trim().min(1).max(64).optional()
});

export const updateConversationMessagesSchema = z.object({
  messages: z.array(chatMessageSchema).max(120),
  documentIds: z.array(z.string().uuid()).max(20).optional()
});
