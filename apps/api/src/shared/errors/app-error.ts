import { HttpStatus, type HttpStatusCode } from "../constants/http-status.js";

export class AppError extends Error {
  readonly statusCode: HttpStatusCode;
  readonly isOperational: boolean;
  readonly details?: unknown;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
  }
}
