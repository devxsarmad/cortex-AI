"use client";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type SelectProps = { value?: string; onValueChange?: (value: string) => void; placeholder?: string; children: ReactNode; ariaLabel: string; triggerClassName?: string; disabled?: boolean };
export function Select({ value, onValueChange, placeholder, children, ariaLabel, triggerClassName, disabled }: SelectProps) {
  return <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}><SelectPrimitive.Trigger aria-label={ariaLabel} className={cn("focus-ring flex h-control w-full items-center justify-between rounded-control border border-border-strong bg-surface px-3 text-body text-text-primary hover:border-text-muted disabled:cursor-not-allowed disabled:opacity-50", triggerClassName)}><SelectPrimitive.Value placeholder={placeholder}/><SelectPrimitive.Icon><ChevronDown className="h-4 w-4 text-text-muted" strokeWidth={1.75}/></SelectPrimitive.Icon></SelectPrimitive.Trigger><SelectPrimitive.Portal><SelectPrimitive.Content position="popper" sideOffset={4} className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-card border border-border bg-surface p-1 shadow-overlay"><SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport></SelectPrimitive.Content></SelectPrimitive.Portal></SelectPrimitive.Root>;
}
export function SelectItem({ value, children }: { value: string; children: ReactNode }) {
  return <SelectPrimitive.Item value={value} className="focus:bg-primary-soft focus:text-primary relative flex h-control cursor-default select-none items-center rounded-control py-1 pl-8 pr-3 text-body text-text-primary outline-none"><SelectPrimitive.ItemIndicator className="absolute left-2"><Check className="h-4 w-4" strokeWidth={1.75}/></SelectPrimitive.ItemIndicator><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText></SelectPrimitive.Item>;
}
