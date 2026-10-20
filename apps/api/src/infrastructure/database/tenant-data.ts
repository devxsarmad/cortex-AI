import type { MembershipRole, Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "./prisma.js";

type Db = PrismaClient | Prisma.TransactionClient;

/** The only data-access entry point for organization-owned rows. */
export const tenantData = (organizationId: string, db: Db = prisma) => ({
  documents: {
    create: (data: Omit<Prisma.DocumentUncheckedCreateInput, "organizationId">) =>
      db.document.create({ data: { ...data, organizationId } }),
    list: () => db.document.findMany({ where: { organizationId } }),
    find: (id: string) => db.document.findFirst({ where: { id, organizationId } }),
    update: (id: string, data: Prisma.DocumentUncheckedUpdateManyInput) =>
      db.document.updateMany({ where: { id, organizationId }, data }),
    delete: (id: string) => db.document.deleteMany({ where: { id, organizationId } })
  },
  conversations: {
    create: (data: Omit<Prisma.ConversationUncheckedCreateInput, "organizationId">, include?: Prisma.ConversationInclude) =>
      db.conversation.create({ data: { ...data, organizationId }, include }),
    list: (createdById: string | undefined, include?: Prisma.ConversationInclude) =>
      db.conversation.findMany({ where: { organizationId, ...(createdById ? { createdById } : {}) }, include }),
    find: (id: string, createdById: string | undefined, include?: Prisma.ConversationInclude) =>
      db.conversation.findFirst({ where: { id, organizationId, ...(createdById ? { createdById } : {}) }, include }),
    update: (id: string, createdById: string | undefined, data: Prisma.ConversationUncheckedUpdateManyInput) =>
      db.conversation.updateMany({ where: { id, organizationId, ...(createdById ? { createdById } : {}) }, data }),
    delete: (id: string, createdById: string | undefined) =>
      db.conversation.deleteMany({ where: { id, organizationId, ...(createdById ? { createdById } : {}) } })
  },
  messages: {
    deleteForConversation: (conversationId: string) => db.message.deleteMany({ where: { conversationId, organizationId } }),
    createMany: (data: Array<Omit<Prisma.MessageUncheckedCreateInput, "organizationId">>) =>
      db.message.createMany({ data: data.map((item) => ({ ...item, organizationId })) })
  },
  memberships: {
    list: () => db.membership.findMany({ where: { organizationId }, include: { user: true }, orderBy: { createdAt: "asc" } }),
    find: (userId: string) => db.membership.findUnique({ where: { organizationId_userId: { organizationId, userId } } }),
    create: (userId: string, role: MembershipRole) => db.membership.create({ data: { organizationId, userId, role } }),
    updateRole: (userId: string, role: MembershipRole) => db.membership.updateMany({ where: { organizationId, userId }, data: { role } }),
    delete: (userId: string) => db.membership.deleteMany({ where: { organizationId, userId } })
  },
  invitations: {
    create: (data: Omit<Prisma.InvitationUncheckedCreateInput, "organizationId">) =>
      db.invitation.create({ data: { ...data, organizationId } }),
    accept: (id: string) => db.invitation.updateMany({ where: { id, organizationId, acceptedAt: null }, data: { acceptedAt: new Date() } })
  },
  refreshTokens: {
    create: (data: Omit<Prisma.RefreshTokenUncheckedCreateInput, "organizationId">) =>
      db.refreshToken.create({ data: { ...data, organizationId } }),
    revoke: (id: string) => db.refreshToken.updateMany({ where: { id, organizationId }, data: { revokedAt: new Date() } })
  }
});

/** Startup-only iteration; never exposed to a request or route. */
export const systemTenantData = {
  listOrganizations: () => prisma.organization.findMany({ select: { id: true } }),
  findInvitationByTokenHash: (tokenHash: string) => prisma.invitation.findUnique({ where: { tokenHash } }),
  findRefreshTokenByHash: (tokenHash: string) => prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } })
};

export const identityData = {
  findUserByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  createUser: (data: Prisma.UserCreateInput) => prisma.user.create({ data })
};
