import type { RequestHandler } from "express";
import { env } from "../../config/env.js";
import { HttpStatus } from "../constants/http-status.js";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

const getClientKey = (requestIp?: string) => requestIp || "unknown";

export const rateLimit: RequestHandler = (request, response, next) => {
  if (request.method === "OPTIONS" || request.path === "/health") {
    next();
    return;
  }

  const now = Date.now();
  const key = getClientKey(request.ip);
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

  response.setHeader("X-RateLimit-Limit", String(env.rateLimitMaxRequests));
  response.setHeader("X-RateLimit-Remaining", String(Math.max(env.rateLimitMaxRequests - bucket.count, 0)));
  response.setHeader("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > env.rateLimitMaxRequests) {
    response.status(HttpStatus.TOO_MANY_REQUESTS).json({
      error: "Too many requests. Please slow down and try again shortly."
    });
    return;
  }

  next();
};
