import { CircleAlert } from "lucide-react";
import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) { return <label className={cn("text-small font-medium text-text-primary", className)} {...props} />; }
export function Field({ label, htmlFor, helper, error, children, className }: { label: string; htmlFor: string; helper?: string; error?: string; children: ReactNode; className?: string }) {
  return <div className={cn("space-y-1.5", className)}><Label htmlFor={htmlFor}>{label}</Label>{children}{error ? <InlineError>{error}</InlineError> : helper ? <HelperText>{helper}</HelperText> : null}</div>;
}
export function HelperText({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) { return <p className={cn("text-caption text-text-secondary", className)} {...props} />; }
export function InlineError({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) { return <p className={cn("flex items-start gap-1.5 text-caption text-danger", className)} {...props}><CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />{children}</p>; }
