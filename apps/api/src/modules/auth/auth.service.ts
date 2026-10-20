import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { MembershipRole } from "@prisma/client";
import { env } from "../../config/env.js";
import { prisma } from "../../infrastructure/database/prisma.js";
import { identityData, systemTenantData, tenantData } from "../../infrastructure/database/tenant-data.js";
import { HttpStatus } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/errors/app-error.js";
import type { z } from "zod";
import type { acceptInvitationSchema, loginSchema, registerSchema } from "./auth.validation.js";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const publicUser = (user: { id: string; email: string; name: string }, organizationId: string, role: MembershipRole) => ({
  id: user.id, email: user.email, name: user.name, organizationId, role
});

export class AuthService {
  async acceptInvitation(input: z.infer<typeof acceptInvitationSchema>) {
    const invitation = await systemTenantData.findInvitationByTokenHash(hashToken(input.token));
    if (!invitation || invitation.acceptedAt || invitation.expiresAt <= new Date()) {
      throw new AppError("Invitation is invalid or expired.", HttpStatus.BAD_REQUEST);
    }
    let user = await identityData.findUserByEmail(invitation.email);
    if (user) {
      if (!(await bcrypt.compare(input.password, user.passwordHash))) {
        throw new AppError("Use the password for the invited account.", HttpStatus.UNAUTHORIZED);
      }
    } else {
      user = await identityData.createUser({ email: invitation.email, name: input.name, passwordHash: await bcrypt.hash(input.password, 12) });
    }
    const scoped = tenantData(invitation.organizationId);
    const existing = await scoped.memberships.find(user.id);
    if (!existing) await scoped.memberships.create(user.id, invitation.role);
    await scoped.invitations.accept(invitation.id);
    return this.createSession(user, invitation.organizationId, existing?.role ?? invitation.role);
  }

  async register(input: z.infer<typeof registerSchema>) {
    const passwordHash = await bcrypt.hash(input.password, 12);
    try {
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({ data: { name: input.name, email: input.email, passwordHash } });
        const organization = await tx.organization.create({ data: { name: input.organizationName } });
        const membership = await tenantData(organization.id, tx).memberships.create(user.id, "OWNER");
        return { user, organization, membership };
      });
      return this.createSession(result.user, result.organization.id, result.membership.role);
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") {
        throw new AppError("An account with this email already exists.", HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  async login(input: z.infer<typeof loginSchema>) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { memberships: { orderBy: { createdAt: "asc" }, take: 1 } }
    });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash)) || !user.memberships[0]) {
      throw new AppError("Invalid email or password.", HttpStatus.UNAUTHORIZED);
    }
    const membership = user.memberships[0];
    return this.createSession(user, membership.organizationId, membership.role);
  }

  async refresh(rawToken?: string) {
    if (!rawToken) throw new AppError("Refresh token required.", HttpStatus.UNAUTHORIZED);
    const stored = await systemTenantData.findRefreshTokenByHash(hashToken(rawToken));
    if (!stored || stored.revokedAt || stored.expiresAt <= new Date()) {
      throw new AppError("Refresh token is invalid or expired.", HttpStatus.UNAUTHORIZED);
    }
    const scoped = tenantData(stored.organizationId);
    const membership = await scoped.memberships.find(stored.userId);
    if (!membership) throw new AppError("Organization membership no longer exists.", HttpStatus.UNAUTHORIZED);
    await scoped.refreshTokens.revoke(stored.id);
    return this.createSession(stored.user, stored.organizationId, membership.role);
  }

  async logout(rawToken?: string) {
    if (!rawToken) return;
    const stored = await systemTenantData.findRefreshTokenByHash(hashToken(rawToken));
    if (stored && !stored.revokedAt) await tenantData(stored.organizationId).refreshTokens.revoke(stored.id);
  }

  private async createSession(user: { id: string; email: string; name: string }, organizationId: string, role: MembershipRole) {
    const accessToken = jwt.sign({ organizationId, role }, env.jwtAccessSecret, {
      subject: user.id, expiresIn: env.jwtAccessTtl as jwt.SignOptions["expiresIn"]
    });
    const refreshToken = randomBytes(48).toString("base64url");
    const expiresAt = new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
    await tenantData(organizationId).refreshTokens.create({ tokenHash: hashToken(refreshToken), userId: user.id, expiresAt });
    return { accessToken, refreshToken, refreshExpiresAt: expiresAt, user: publicUser(user, organizationId, role) };
  }
}

export const authService = new AuthService();
