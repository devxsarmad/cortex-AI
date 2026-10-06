import type { Request } from "express";

export const DEFAULT_OWNER_ID = "local-user";

export const normalizeOwnerId = (ownerId?: string) => {
  const normalized = ownerId?.trim();
  return normalized && normalized.length <= 120 ? normalized : DEFAULT_OWNER_ID;
};

export const getRequestOwnerId = (request: Request) => {
  return normalizeOwnerId(request.header("x-cortex-user-id"));
};
