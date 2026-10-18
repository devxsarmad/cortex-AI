"use client";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";
export function TooltipProvider({ children }: { children: ReactNode }) { return <TooltipPrimitive.Provider delayDuration={300}>{children}</TooltipPrimitive.Provider>; }
export function Tooltip({ children, content }: { children: ReactNode; content: ReactNode }) { return <TooltipPrimitive.Root><TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger><TooltipPrimitive.Portal><TooltipPrimitive.Content sideOffset={6} className="z-50 rounded-control bg-ink px-2 py-1 text-caption text-text-on-brand shadow-overlay">{content}<TooltipPrimitive.Arrow className="fill-ink" /></TooltipPrimitive.Content></TooltipPrimitive.Portal></TooltipPrimitive.Root>; }
