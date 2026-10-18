import type { Request } from "express";
import { AppError } from "../errors/app-error.js";
import { HttpStatus } from "../constants/http-status.js";

export const getRequestAuth = (request: Request) => {
  if (!request.auth) throw new AppError("Authentication required.", HttpStatus.UNAUTHORIZED);
  return request.auth;
};
