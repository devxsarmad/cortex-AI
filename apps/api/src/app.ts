import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
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
import { authRouter } from "./modules/auth/auth.routes.js";
import { requireAuth } from "./shared/middleware/auth.js";
import { memberRouter } from "./modules/members/member.routes.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.nodeEnv === "production" ? env.clientOrigin : true,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "x-cortex-api-key"]
    })
  );
  app.use(securityHeaders);
  app.use(requestLogger);
  app.use(rateLimit);
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

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

  app.use("/api/auth", authRouter);
  app.use(apiKeyAuth);
  app.use("/api/ops", requireAuth, opsRouter);
  app.use("/api/chat", requireAuth, chatRouter);
  app.use("/api/conversations", requireAuth, conversationRouter);
  app.use("/api/documents", requireAuth, documentRouter);
  app.use("/api/members", requireAuth, memberRouter);
  app.use(errorHandler);

  return app;
};
