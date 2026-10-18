"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/utils/cn";

const palettes = ["bg-primary-soft text-primary", "bg-info-soft text-info", "bg-success-soft text-success", "bg-warning-soft text-warning"];
const initialsFor = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
const paletteFor = (name: string) => palettes[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palettes.length];
export function Avatar({ name, src, className }: { name: string; src?: string; className?: string }) { return <AvatarPrimitive.Root className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full", className)}><AvatarPrimitive.Image src={src} alt={name} className="h-full w-full object-cover" /><AvatarPrimitive.Fallback className={cn("flex h-full w-full items-center justify-center text-caption font-medium", paletteFor(name))}>{initialsFor(name)}</AvatarPrimitive.Fallback></AvatarPrimitive.Root>; }
