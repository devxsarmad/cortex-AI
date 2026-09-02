import type { RequestHandler } from "express";
import { env } from "../../config/env.js";
import { HttpStatus } from "../constants/http-status.js";

const getBearerToken = (authorization?: string) => {
  if (!authorization?.startsWith("Bearer ")) return undefined;
  return authorization.slice("Bearer ".length);
};

export const apiKeyAuth: RequestHandler = (request, response, next) => {
  if (!env.cortexApiKey || request.method === "OPTIONS" || request.path === "/health") {
    next();
    return;
  }

  const apiKey = request.header("x-cortex-api-key") || getBearerToken(request.header("authorization"));
  if (apiKey === env.cortexApiKey) {
    next();
    return;
  }

  response.status(HttpStatus.UNAUTHORIZED).json({
    error: "A valid Cortex API key is required."
  });
};
