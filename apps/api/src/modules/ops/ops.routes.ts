import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import { getUsage } from "./ops.controller.js";
import { requireRole } from "../../shared/middleware/require-role.js";

export const opsRouter = Router();

opsRouter.get("/usage", requireRole("OWNER"), asyncHandler(getUsage));
