"use client";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ReactNode } from "react";
export function Tabs({ defaultValue, children }: { defaultValue: string; children: ReactNode }) { return <TabsPrimitive.Root defaultValue={defaultValue}>{children}</TabsPrimitive.Root>; }
export function TabsList({ children }: { children: ReactNode }) { return <TabsPrimitive.List className="flex border-b border-border">{children}</TabsPrimitive.List>; }
export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) { return <TabsPrimitive.Trigger value={value} className="focus-ring -mb-px h-control border-b-2 border-transparent px-3 text-body font-medium text-text-secondary data-[state=active]:border-primary data-[state=active]:text-primary">{children}</TabsPrimitive.Trigger>; }
export function TabsContent({ value, children }: { value: string; children: ReactNode }) { return <TabsPrimitive.Content value={value} className="focus-ring py-4">{children}</TabsPrimitive.Content>; }
