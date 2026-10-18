"use client";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
export function DropdownMenu({ trigger, children, align = "end" }: { trigger: ReactNode; children: ReactNode; align?: "start" | "center" | "end" }) { return <DropdownPrimitive.Root><DropdownPrimitive.Trigger asChild>{trigger}</DropdownPrimitive.Trigger><DropdownPrimitive.Portal><DropdownPrimitive.Content align={align} sideOffset={6} className="z-50 min-w-44 rounded-card border border-border bg-surface p-1 shadow-overlay">{children}</DropdownPrimitive.Content></DropdownPrimitive.Portal></DropdownPrimitive.Root>; }
export function DropdownItem({ children, danger = false, onSelect }: { children: ReactNode; danger?: boolean; onSelect?: () => void }) { return <DropdownPrimitive.Item onSelect={onSelect} className={cn("flex h-control cursor-default select-none items-center gap-2 rounded-control px-2.5 text-body outline-none focus:bg-primary-soft focus:text-primary", danger ? "text-danger focus:bg-danger-soft focus:text-danger" : "text-text-primary")}>{children}</DropdownPrimitive.Item>; }
export function DropdownSeparator() { return <DropdownPrimitive.Separator className="my-1 h-px bg-border" />; }
