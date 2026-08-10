import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../../config/env.js";
import { HttpStatus } from "../constants/http-status.js";
import { AppError } from "./app-error.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  void next;

  if (error instanceof ZodError) {
    response.status(HttpStatus.BAD_REQUEST).json({
      error: "Validation failed",
      details: error.flatten()
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: error.message,
      details: error.details
    });
    return;
  }

  console.error(error);

  response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    error: "Internal server error",
    details: env.nodeEnv === "development" && error instanceof Error ? error.message : undefined
  });
};
