import type { RequestHandler } from "express";
import { getRequestAuth } from "../../shared/request/request-auth.js";
import { HttpStatus } from "../../shared/constants/http-status.js";
import { memberService } from "./member.service.js";
import { changeRoleSchema, inviteMemberSchema, memberIdSchema } from "./member.validation.js";

export const listMembers: RequestHandler = async (request, response) => {
  response.json({ members: await memberService.list(getRequestAuth(request).organizationId) });
};
export const inviteMember: RequestHandler = async (request, response) => {
  const auth = getRequestAuth(request); const input = inviteMemberSchema.parse(request.body);
  response.status(HttpStatus.CREATED).json({ invitation: await memberService.invite(auth.organizationId, input.email, input.role) });
};
export const changeMemberRole: RequestHandler = async (request, response) => {
  const auth = getRequestAuth(request); const { userId } = memberIdSchema.parse(request.params); const { role } = changeRoleSchema.parse(request.body);
  await memberService.changeRole(auth.organizationId, auth.userId, auth.role, userId, role); response.status(HttpStatus.NO_CONTENT).end();
};
export const removeMember: RequestHandler = async (request, response) => {
  const auth = getRequestAuth(request); const { userId } = memberIdSchema.parse(request.params);
  await memberService.remove(auth.organizationId, auth.userId, auth.role, userId); response.status(HttpStatus.NO_CONTENT).end();
};
