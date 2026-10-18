import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("focus-ring min-h-24 w-full resize-y rounded-control border border-border-strong bg-surface px-3 py-2 text-body text-text-primary placeholder:text-text-muted hover:border-text-muted disabled:cursor-not-allowed disabled:bg-canvas disabled:text-text-muted aria-[invalid=true]:border-danger", className)} {...props} />;
}
