import type { RequestHandler } from "express";
import { usageService } from "./usage.service.js";

export const getUsage: RequestHandler = (_request, response) => {
  response.json({
    usage: usageService.getSnapshot()
  });
};
