import type { RequestHandler } from "express";
import { env } from "../../config/env.js";
import { HttpStatus } from "../constants/http-status.js";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

const getClientKey = (requestIp?: string) => requestIp || "unknown";

export const createRateLimit = (options?: { maxRequests?: number; keyPrefix?: string }): RequestHandler => (request, response, next) => {
  if (request.method === "OPTIONS" || request.path === "/health") {
    next();
    return;
  }

  const now = Date.now();
  const key = `${options?.keyPrefix ?? "global"}:${getClientKey(request.ip)}`;
  const maxRequests = options?.maxRequests ?? env.rateLimitMaxRequests;
  const current = buckets.get(key);
  const bucket =
    current && current.resetAt > now
      ? current
      : {
          count: 0,
          resetAt: now + env.rateLimitWindowMs
        };

  bucket.count += 1;
  buckets.set(key, bucket);

  response.setHeader("X-RateLimit-Limit", String(maxRequests));
  response.setHeader("X-RateLimit-Remaining", String(Math.max(maxRequests - bucket.count, 0)));
  response.setHeader("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > maxRequests) {
    response.status(HttpStatus.TOO_MANY_REQUESTS).json({
      error: "Too many requests. Please slow down and try again shortly."
    });
    return;
  }

  next();
};

export const rateLimit = createRateLimit();
