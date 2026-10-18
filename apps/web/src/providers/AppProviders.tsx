"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
      mutations: { retry: 0 }
    }
  }));

  return <QueryClientProvider client={queryClient}><AuthProvider><TooltipProvider><ToastProvider swipeDirection="right">{children}<ToastViewport/></ToastProvider></TooltipProvider></AuthProvider></QueryClientProvider>;
}
