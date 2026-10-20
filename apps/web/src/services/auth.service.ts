import { API_URL } from "./api-client";

export type AuthUser = { id: string; email: string; name: string; organizationId: string; role: "OWNER" | "ADMIN" | "MEMBER" };
export type AuthSession = { accessToken: string; user: AuthUser };
export type LoginInput = { email: string; password: string };
export type RegisterInput = LoginInput & { name: string; organizationName: string };
export type AcceptInvitationInput = { token: string; name: string; password: string };

const authRequest = async (path: string, body?: object): Promise<AuthSession> => {
  const response = await fetch(`${API_URL}/api/auth/${path}`, {
    method: "POST", credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json().catch(() => null) as (AuthSession & { error?: string }) | null;
  if (!response.ok || !payload) throw new Error(payload?.error ?? "Authentication failed.");
  return payload;
};

export const authApi = {
  login: (input: LoginInput) => authRequest("login", input),
  register: (input: RegisterInput) => authRequest("register", input),
  acceptInvitation: (input: AcceptInvitationInput) => authRequest("invitations/accept", input),
  refresh: () => authRequest("refresh"),
  logout: async () => {
    const response = await fetch(`${API_URL}/api/auth/logout`, { method: "POST", credentials: "include" });
    if (!response.ok && response.status !== 401) throw new Error("Could not sign out.");
  }
};
