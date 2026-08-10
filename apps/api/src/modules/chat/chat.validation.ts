import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(20_000)
});

export const streamChatSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(40)
});
