import type { MembershipRole } from "@prisma/client";
import type { RequestHandler } from "express";
import { HttpStatus } from "../constants/http-status.js";
import { AppError } from "../errors/app-error.js";

export const requireRole = (...roles: MembershipRole[]): RequestHandler => (request, _response, next) => {
  if (!request.auth) throw new AppError("Authentication required.", HttpStatus.UNAUTHORIZED);
  if (!roles.includes(request.auth.role)) throw new AppError("Insufficient permissions.", HttpStatus.FORBIDDEN);
  next();
};
