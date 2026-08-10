import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-clinical disabled:bg-slate-300",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:border-clinical hover:text-clinical disabled:opacity-50",
  ghost: "text-slate-700 hover:bg-slate-100 disabled:opacity-50"
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
