import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; loading?: boolean };

const variants: Record<ButtonVariant, string> = {
  primary: "border-primary bg-primary text-text-on-brand hover:border-primary-hover hover:bg-primary-hover active:bg-primary-hover",
  secondary: "border-border-strong bg-surface text-text-primary hover:bg-canvas active:bg-primary-soft",
  ghost: "border-transparent bg-transparent text-text-secondary hover:bg-primary-soft hover:text-primary active:bg-primary-soft",
  danger: "border-danger bg-danger text-text-on-brand hover:bg-danger/90 active:bg-danger"
};
const sizes: Record<ButtonSize, string> = { sm: "h-control-sm px-2.5 text-small", md: "h-control px-3 text-body" };

export function Button({ className, variant = "primary", size = "md", loading = false, disabled, children, ...props }: ButtonProps) {
  return <button className={cn("focus-ring relative inline-flex shrink-0 items-center justify-center gap-2 rounded-control border font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50", variants[variant], sizes[size], className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
    {loading && <LoaderCircle aria-hidden="true" className="absolute h-4 w-4 animate-spin" strokeWidth={1.75} />}
    <span className={cn("inline-flex items-center gap-2", loading && "invisible")}>{children}</span>
  </button>;
}
