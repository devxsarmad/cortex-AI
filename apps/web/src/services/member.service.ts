import { apiRequest } from "./api-client";
import type { AuthUser } from "./auth.service";
export type Member = Pick<AuthUser, "id" | "email" | "name" | "role"> & { joinedAt: string };
export type Invitation = { email: string; role: "ADMIN" | "MEMBER"; expiresAt: string; inviteUrl: string };
export const memberApi = {
  list: async () => (await apiRequest<{ members: Member[] }>("/api/members")).members,
  invite: async (email: string, role: "ADMIN" | "MEMBER") => (await apiRequest<{ invitation: Invitation }>("/api/members/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role }) })).invitation,
  changeRole: (userId: string, role: AuthUser["role"]) => apiRequest(`/api/members/${userId}/role`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) }),
  remove: (userId: string) => apiRequest(`/api/members/${userId}`, { method: "DELETE" })
};
