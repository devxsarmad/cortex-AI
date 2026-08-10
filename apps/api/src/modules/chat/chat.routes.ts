import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import { streamChat } from "./chat.controller.js";

export const chatRouter = Router();

chatRouter.post("/stream", asyncHandler(streamChat));
