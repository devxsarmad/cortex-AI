import { z } from "zod";

export const inviteMemberSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER")
});
export const memberIdSchema = z.object({ userId: z.string().uuid() });
export const changeRoleSchema = z.object({ role: z.enum(["OWNER", "ADMIN", "MEMBER"]) });
