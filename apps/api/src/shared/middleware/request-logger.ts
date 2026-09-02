import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

export const requestLogger: RequestHandler = (request, response, next) => {
  const requestId = randomUUID();
  const startedAt = Date.now();

  response.locals.requestId = requestId;
  response.setHeader("X-Request-Id", requestId);

  response.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.info(
      JSON.stringify({
        requestId,
        method: request.method,
        path: request.path,
        statusCode: response.statusCode,
        durationMs
      })
    );
  });

  next();
};
