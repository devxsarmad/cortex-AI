"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { revealable?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, type, revealable = false, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  const password = type === "password" && revealable;
  return <div className="relative w-full">
    <input ref={ref} type={password && visible ? "text" : type} className={cn("focus-ring h-control w-full rounded-control border border-border-strong bg-surface px-3 text-body text-text-primary placeholder:text-text-muted hover:border-text-muted disabled:cursor-not-allowed disabled:bg-canvas disabled:text-text-muted aria-[invalid=true]:border-danger", password && "pr-10", className)} {...props} />
    {password && <button type="button" className="focus-ring absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-control text-text-muted hover:bg-canvas hover:text-text-primary" onClick={() => setVisible((value) => !value)} aria-label={visible ? "Hide password" : "Show password"}>
      {visible ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
    </button>}
  </div>;
});
