import { createHash, randomBytes } from "node:crypto";
import type { MembershipRole } from "@prisma/client";
import { env } from "../../config/env.js";
import { identityData, tenantData } from "../../infrastructure/database/tenant-data.js";
import { AppError } from "../../shared/errors/app-error.js";
import { HttpStatus } from "../../shared/constants/http-status.js";

const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const notFound = () => new AppError("Member not found.", HttpStatus.NOT_FOUND);

export class MemberService {
  async list(organizationId: string) {
    return (await tenantData(organizationId).memberships.list()).map(({ user, role, createdAt }) => ({
      id: user.id, email: user.email, name: user.name, role, joinedAt: createdAt.toISOString()
    }));
  }

  async invite(organizationId: string, email: string, role: Exclude<MembershipRole, "OWNER">) {
    const existing = await identityData.findUserByEmail(email);
    if (existing && await tenantData(organizationId).memberships.find(existing.id)) {
      throw new AppError("This user is already a member.", HttpStatus.BAD_REQUEST);
    }
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await tenantData(organizationId).invitations.create({ email, role, tokenHash: hash(token), expiresAt });
    return { email, role, expiresAt: expiresAt.toISOString(), inviteUrl: `${env.clientOrigin}/register?invite=${token}` };
  }

  async changeRole(organizationId: string, actorId: string, actorRole: MembershipRole, userId: string, role: MembershipRole) {
    const member = await tenantData(organizationId).memberships.find(userId);
    if (!member) throw notFound();
    if (actorRole !== "OWNER" && (member.role === "OWNER" || role === "OWNER")) throw notFound();
    if (userId === actorId && member.role === "OWNER" && role !== "OWNER") {
      throw new AppError("Owners cannot demote themselves.", HttpStatus.BAD_REQUEST);
    }
    await tenantData(organizationId).memberships.updateRole(userId, role);
  }

  async remove(organizationId: string, actorId: string, actorRole: MembershipRole, userId: string) {
    const member = await tenantData(organizationId).memberships.find(userId);
    if (!member || (actorRole !== "OWNER" && member.role === "OWNER")) throw notFound();
    if (userId === actorId) throw new AppError("You cannot remove yourself.", HttpStatus.BAD_REQUEST);
    await tenantData(organizationId).memberships.delete(userId);
  }
}

export const memberService = new MemberService();
