import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../../config/env.js";
import { HttpStatus } from "../constants/http-status.js";
import { AppError } from "./app-error.js";

export const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
  void next;
  const requestId = response.locals.requestId;

  if (error instanceof ZodError) {
    response.status(HttpStatus.BAD_REQUEST).json({
      requestId,
      error: "Validation failed",
      details: error.flatten()
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      requestId,
      error: error.message,
      details: error.details
    });
    return;
  }

  const normalizedError = error instanceof Error ? error : new Error(String(error));
  const prismaError = error as { code?: string; meta?: unknown; clientVersion?: string };
  console.error(JSON.stringify({
    level: "error",
    requestId,
    method: request.method,
    path: request.originalUrl,
    errorName: normalizedError.name,
    errorMessage: normalizedError.message,
    errorCode: prismaError.code,
    errorMeta: prismaError.meta,
    prismaClientVersion: prismaError.clientVersion,
    stack: normalizedError.stack
  }));

  response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    requestId,
    error: "Internal server error",
    details: env.nodeEnv === "development" && error instanceof Error ? error.message : undefined
  });
};
