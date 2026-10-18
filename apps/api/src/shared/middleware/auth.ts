import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import type { MembershipRole } from "@prisma/client";
import { env } from "../../config/env.js";
import { HttpStatus } from "../constants/http-status.js";
import { AppError } from "../errors/app-error.js";

export const requireAuth: RequestHandler = (request, _response, next) => {
  const [scheme, token] = request.header("authorization")?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) throw new AppError("Authentication required.", HttpStatus.UNAUTHORIZED);
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as jwt.JwtPayload & { organizationId?: string; role?: MembershipRole };
    if (!payload.sub || !payload.organizationId || !payload.role) throw new Error("Missing claims");
    request.auth = { userId: payload.sub, organizationId: payload.organizationId, role: payload.role };
    next();
  } catch {
    throw new AppError("Access token is invalid or expired.", HttpStatus.UNAUTHORIZED);
  }
};
