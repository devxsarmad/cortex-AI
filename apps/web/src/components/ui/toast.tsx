"use client";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, X } from "lucide-react";
import type { ReactNode } from "react";
export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = () => <ToastPrimitive.Viewport className="fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 outline-none" />;
export function Toast({ open, onOpenChange, title, description }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: ReactNode }) { return <ToastPrimitive.Root open={open} onOpenChange={onOpenChange} duration={4000} className="grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-card border border-border bg-surface p-3 shadow-overlay data-[state=open]:animate-[fade-in_150ms_ease-out]"><CheckCircle2 className="mt-0.5 h-4 w-4 text-success" strokeWidth={1.75} /><div><ToastPrimitive.Title className="text-body font-medium text-text-primary">{title}</ToastPrimitive.Title>{description && <ToastPrimitive.Description className="mt-0.5 text-small text-text-secondary">{description}</ToastPrimitive.Description>}</div><ToastPrimitive.Close className="focus-ring flex h-6 w-6 items-center justify-center rounded-control text-text-muted hover:bg-canvas" aria-label="Dismiss notification"><X className="h-4 w-4" strokeWidth={1.75} /></ToastPrimitive.Close></ToastPrimitive.Root>; }
