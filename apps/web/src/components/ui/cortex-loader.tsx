import Image from "next/image";
import { cn } from "@/utils/cn";

type CortexLoaderProps = {
  message: string;
  detail?: string;
  overlay?: boolean;
  className?: string;
};

export function CortexLoader({ message, detail, overlay = false, className }: CortexLoaderProps) {
  return <div className={cn(overlay ? "absolute inset-0 z-10 bg-surface/95" : "min-h-64 w-full", "flex items-center justify-center", className)} role="status" aria-live="polite" aria-busy="true">
    <div className="flex max-w-sm flex-col items-center px-6 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-primary-soft border-t-primary" aria-hidden="true" />
        <span className="flex h-12 w-12 items-center justify-center rounded-modal border border-primary-border bg-surface">
          <Image src="/icon.svg" alt="" width={36} height={36} className="rounded-control" priority />
        </span>
      </div>
      <p className="mt-4 text-body font-semibold text-text-primary">{message}</p>
      {detail && <p className="mt-1 text-small text-text-secondary">{detail}</p>}
      <span className="sr-only">Please wait</span>
    </div>
  </div>;
}
