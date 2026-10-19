import type { RequestHandler, Response } from "express";
import { env } from "../../config/env.js";
import { HttpStatus } from "../../shared/constants/http-status.js";
import { authService } from "./auth.service.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

export const REFRESH_COOKIE = "cortex_refresh";
const refreshCookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" as const : "strict" as const,
  // The production web app proxies API calls under /backend. A root path lets
  // the browser send this cookie through that same-origin proxy as well as to
  // the API directly in local development.
  path: "/"
};
const setRefreshCookie = (response: Response, token: string, expires: Date) => response.cookie(REFRESH_COOKIE, token, {
  ...refreshCookieOptions, expires
});

export const register: RequestHandler = async (request, response) => {
  const session = await authService.register(registerSchema.parse(request.body));
  setRefreshCookie(response, session.refreshToken, session.refreshExpiresAt);
  response.status(HttpStatus.CREATED).json({ accessToken: session.accessToken, user: session.user });
};

export const login: RequestHandler = async (request, response) => {
  const session = await authService.login(loginSchema.parse(request.body));
  setRefreshCookie(response, session.refreshToken, session.refreshExpiresAt);
  response.json({ accessToken: session.accessToken, user: session.user });
};

export const refresh: RequestHandler = async (request, response) => {
  const session = await authService.refresh(request.cookies?.[REFRESH_COOKIE]);
  setRefreshCookie(response, session.refreshToken, session.refreshExpiresAt);
  response.json({ accessToken: session.accessToken, user: session.user });
};

export const logout: RequestHandler = async (request, response) => {
  await authService.logout(request.cookies?.[REFRESH_COOKIE]);
  response.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
  response.status(204).end();
};
