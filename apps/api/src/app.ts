import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { chatRouter } from "./modules/chat/chat.routes.js";
import { conversationRouter } from "./modules/conversations/conversation.routes.js";
import { documentRouter } from "./modules/documents/document.routes.js";
import { opsRouter } from "./modules/ops/ops.routes.js";
import { errorHandler } from "./shared/errors/error-handler.js";
import { apiKeyAuth } from "./shared/middleware/api-key-auth.js";
import { rateLimit } from "./shared/middleware/rate-limit.js";
import { requestLogger } from "./shared/middleware/request-logger.js";
import { securityHeaders } from "./shared/middleware/security-headers.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin,
      allowedHeaders: ["Content-Type", "Authorization", "x-cortex-api-key"]
    })
  );
  app.use(securityHeaders);
  app.use(requestLogger);
  app.use(rateLimit);
  app.use(apiKeyAuth);
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_request, response) => {
    response.json({
      ok: true,
      service: "cortex-api",
      environment: env.nodeEnv,
      uptimeSeconds: Math.round(process.uptime()),
      providers: {
        llm: env.openaiApiKey ? "openai" : "mock",
        vectorStore: env.vectorStoreProvider
      }
    });
  });

  app.use("/api/ops", opsRouter);
  app.use("/api/chat", chatRouter);
  app.use("/api/conversations", conversationRouter);
  app.use("/api/documents", documentRouter);
  app.use(errorHandler);

  return app;
};
