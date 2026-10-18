import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";
const tones: Record<BadgeTone, string> = { neutral: "bg-canvas text-text-secondary", info: "bg-info-soft text-info", success: "bg-success-soft text-success", warning: "bg-warning-soft text-warning", danger: "bg-danger-soft text-danger" };
export function Badge({ tone = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) { return <span className={cn("inline-flex min-h-5 items-center rounded-full px-2 py-0.5 text-caption font-medium", tones[tone], className)} {...props} />; }
export type DocumentStatus = "Queued" | "Processing" | "Ready" | "Failed";
const statusTone: Record<DocumentStatus, BadgeTone> = { Queued: "neutral", Processing: "info", Ready: "success", Failed: "danger" };
export function StatusPill({ status }: { status: DocumentStatus }) { return <Badge tone={statusTone[status]}><span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />{status}</Badge>; }
