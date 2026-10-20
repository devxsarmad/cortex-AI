"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { setAccessToken } from "@/services/api-client";
import { authApi, type AcceptInvitationInput, type AuthSession, type AuthUser, type LoginInput, type RegisterInput } from "@/services/auth.service";
import { CortexLoader } from "@/components/ui/cortex-loader";
import { Toast } from "@/components/ui/toast";

const sessionKey = ["auth", "session"] as const;
type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  acceptInvitation: (input: AcceptInvitationInput) => Promise<void>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [sessionExpired, setSessionExpired] = useState(false);
  const isPublicAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const sessionQuery = useQuery({
    queryKey: sessionKey,
    queryFn: async () => {
      const session = await authApi.refresh();
      setAccessToken(session.accessToken);
      return session;
    },
    enabled: !isPublicAuthPage,
    retry: false,
    staleTime: Infinity
  });

  const acceptSession = (session: AuthSession) => {
    setAccessToken(session.accessToken);
    queryClient.setQueryData(sessionKey, session);
    router.replace("/");
  };
  const loginMutation = useMutation({ mutationFn: authApi.login, onSuccess: acceptSession });
  const registerMutation = useMutation({ mutationFn: authApi.register, onSuccess: acceptSession });
  const invitationMutation = useMutation({ mutationFn: authApi.acceptInvitation, onSuccess: acceptSession });
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      setAccessToken(null);
      queryClient.clear();
      queryClient.setQueryData(sessionKey, null);
      router.replace("/login");
    }
  });

  useEffect(() => {
    const session = sessionQuery.data;
    if (session) {
      setAccessToken(session.accessToken);
      if (isPublicAuthPage) router.replace("/");
    }
    if (sessionQuery.isError) {
      setAccessToken(null);
      if (!isPublicAuthPage) router.replace("/login");
    }
  }, [isPublicAuthPage, router, sessionQuery.data, sessionQuery.isError]);

  useEffect(() => {
    const unauthorized = () => {
      setAccessToken(null);
      queryClient.setQueryData(sessionKey, null);
      setSessionExpired(true);
      router.replace("/login");
    };
    window.addEventListener("cortex:unauthorized", unauthorized);
    return () => window.removeEventListener("cortex:unauthorized", unauthorized);
  }, [queryClient, router]);

  return <AuthContext.Provider value={{
    user: sessionQuery.data?.user ?? null,
    loading: !isPublicAuthPage && sessionQuery.isPending,
    login: async (input) => { await loginMutation.mutateAsync(input); },
    register: async (input) => { await registerMutation.mutateAsync(input); },
    acceptInvitation: async (input) => { await invitationMutation.mutateAsync(input); },
    logout: async () => { await logoutMutation.mutateAsync(); }
  }}>{children}<Toast open={sessionExpired} onOpenChange={setSessionExpired} tone="danger" title="Your session has expired" description="Sign in again to continue securely." /></AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading || !user) return <main className="min-h-screen bg-canvas"><CortexLoader className="min-h-screen" message="Opening your workspace" detail="Checking your secure session…" /></main>;
  return children;
}
