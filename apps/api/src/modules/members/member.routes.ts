import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import { requireRole } from "../../shared/middleware/require-role.js";
import { changeMemberRole, inviteMember, listMembers, removeMember } from "./member.controller.js";

export const memberRouter = Router();
memberRouter.use(requireRole("OWNER", "ADMIN"));
memberRouter.get("/", asyncHandler(listMembers));
memberRouter.post("/invite", asyncHandler(inviteMember));
memberRouter.patch("/:userId/role", asyncHandler(changeMemberRole));
memberRouter.delete("/:userId", asyncHandler(removeMember));
