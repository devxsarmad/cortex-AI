"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { API_URL, setAccessToken } from "@/services/api-client";

export type AuthUser = { id: string; email: string; name: string; organizationId: string; role: "OWNER" | "ADMIN" | "MEMBER" };
type Credentials = { email: string; password: string };
type AuthContextValue = { user: AuthUser | null; loading: boolean; login: (input: Credentials) => Promise<void>; register: (input: Credentials & { name: string; organizationName: string }) => Promise<void>; logout: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const acceptSession = (session: { accessToken: string; user: AuthUser }) => { setAccessToken(session.accessToken); setUser(session.user); };
  const submit = useCallback(async (path: "login" | "register", input: object) => {
    const response = await fetch(`${API_URL}/api/auth/${path}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error ?? "Authentication failed.");
    acceptSession(payload); router.replace("/");
  }, [router]);
  useEffect(() => {
    fetch(`${API_URL}/api/auth/refresh`, { method: "POST", credentials: "include" })
      .then(async (response) => { if (!response.ok) throw new Error(); const session = await response.json(); setAccessToken(session.accessToken); setUser(session.user); })
      .catch(() => { setAccessToken(null); setUser(null); const path = window.location.pathname; if (!path.startsWith("/login") && !path.startsWith("/register")) router.replace("/login"); })
      .finally(() => setLoading(false));
  }, [router]);
  useEffect(() => {
    const unauthorized = () => { setUser(null); router.replace("/login"); };
    window.addEventListener("cortex:unauthorized", unauthorized);
    return () => window.removeEventListener("cortex:unauthorized", unauthorized);
  }, [router]);
  const logout = async () => { await fetch(`${API_URL}/api/auth/logout`, { method: "POST", credentials: "include" }); setAccessToken(null); setUser(null); router.replace("/login"); };
  return <AuthContext.Provider value={{ user, loading, login: (input) => submit("login", input), register: (input) => submit("register", input), logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used within AuthProvider"); return context; };
export function RequireAuth({ children }: { children: ReactNode }) { const { user, loading } = useAuth(); if (loading || !user) return <main className="grid min-h-screen place-items-center text-sm text-slate-500">Loading Cortex…</main>; return children; }
