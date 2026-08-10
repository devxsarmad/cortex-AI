import type { RequestHandler } from "express";
import { chatService } from "./chat.service.js";
import { streamChatSchema } from "./chat.validation.js";

export const streamChat: RequestHandler = async (request, response) => {
  const input = streamChatSchema.parse(request.body);

  response.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  response.setHeader("Cache-Control", "no-cache, no-transform");
  response.setHeader("Connection", "keep-alive");

  const stream = chatService.createChatStream(input);
  const reader = stream.getReader();

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      response.write(value);
    }
  } finally {
    response.end();
  }
};
