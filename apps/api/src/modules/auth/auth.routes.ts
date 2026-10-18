import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import { createRateLimit } from "../../shared/middleware/rate-limit.js";
import { login, logout, refresh, register } from "./auth.controller.js";
import { env } from "../../config/env.js";

export const authRouter = Router();
const authRateLimit = createRateLimit({ maxRequests: env.authRateLimitMaxRequests, keyPrefix: "auth" });

authRouter.post("/register", authRateLimit, asyncHandler(register));
authRouter.post("/login", authRateLimit, asyncHandler(login));
authRouter.post("/refresh", authRateLimit, asyncHandler(refresh));
authRouter.post("/logout", asyncHandler(logout));
