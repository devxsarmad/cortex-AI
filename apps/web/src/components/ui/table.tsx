import type { HTMLAttributes, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";
import { cn } from "@/utils/cn";
export function TableContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("overflow-hidden rounded-card border border-border bg-surface", className)} {...props} />; }
export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) { return <table className={cn("w-full border-collapse text-left text-body", className)} {...props} />; }
export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) { return <thead className={cn("bg-sidebar text-small font-medium text-text-secondary", className)} {...props} />; }
export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) { return <tbody className={cn("divide-y divide-border", className)} {...props} />; }
export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) { return <tr className={cn("transition-colors hover:bg-canvas", className)} {...props} />; }
export function TableHeader({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) { return <th className={cn("h-10 px-3 font-medium", className)} {...props} />; }
export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) { return <td className={cn("h-12 px-3 text-text-primary", className)} {...props} />; }
