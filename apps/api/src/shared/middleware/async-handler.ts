import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRequestHandler = (
  request: Request,
  response: Response,
  next: NextFunction
) => Promise<unknown> | unknown;

export const asyncHandler = (handler: AsyncRequestHandler): RequestHandler => {
  return (request, response, next) => {
    void Promise.resolve(handler(request, response, next)).catch(next);
  };
};
