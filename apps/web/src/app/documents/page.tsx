import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/features/auth/AuthProvider";
import { DocumentPanel } from "@/features/documents/components/DocumentPanel";
export const metadata: Metadata = { title: "Documents · Cortex AI" };
export default function DocumentsPage() { return <RequireAuth><AppShell><DocumentPanel/></AppShell></RequireAuth>; }
