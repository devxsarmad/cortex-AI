import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { chatRouter } from "./modules/chat/chat.routes.js";
import { errorHandler } from "./shared/errors/error-handler.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_request, response) => {
    response.json({
      ok: true,
      service: "cortex-api"
    });
  });

  app.use("/api/chat", chatRouter);
  app.use(errorHandler);

  return app;
};
