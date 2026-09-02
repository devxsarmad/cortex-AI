import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import { getUsage } from "./ops.controller.js";

export const opsRouter = Router();

opsRouter.get("/usage", asyncHandler(getUsage));
