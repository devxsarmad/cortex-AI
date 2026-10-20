"use client";

import { LockKeyhole } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequireAuth, useAuth } from "@/features/auth/AuthProvider";
import { MemberPanel } from "@/features/settings/MemberPanel";

function SettingsContent() {
  const { user } = useAuth();
  const canManageMembers = user?.role === "OWNER" || user?.role === "ADMIN";
  return <AppShell provider="openai"><div className="mx-auto max-w-4xl p-4 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-page font-semibold">Organization settings</h2><p className="mt-1 text-text-secondary">Manage workspace access and security.</p></div><Badge tone="info">Your role: {user?.role.toLowerCase()}</Badge></div>
    {!canManageMembers && <div className="mt-5 flex gap-3 rounded-card border border-border bg-surface p-4"><LockKeyhole className="mt-0.5 h-4 w-4 text-text-muted"/><div><p className="text-small font-medium">Member access is read-only</p><p className="mt-1 text-caption text-text-secondary">An administrator or owner manages members, documents, and organization settings.</p></div></div>}
    <Tabs defaultValue={canManageMembers ? "members" : "general"}><div className="mt-6"><TabsList><TabsTrigger value="general">General</TabsTrigger>{canManageMembers && <TabsTrigger value="members">Members</TabsTrigger>}<TabsTrigger value="security">Security</TabsTrigger></TabsList></div>
      <TabsContent value="general"><section className="rounded-card border border-border bg-surface p-card"><h3 className="text-section font-semibold">Workspace</h3><div className="mt-4 max-w-md"><Field label="Organization name" htmlFor="org-name"><Input id="org-name" value="Organization workspace" readOnly/></Field></div></section></TabsContent>
      {canManageMembers && <TabsContent value="members"><MemberPanel/></TabsContent>}
      <TabsContent value="security"><section className="rounded-card border border-border bg-surface p-card"><h3 className="text-section font-semibold">Security controls</h3><Badge tone="info" className="mt-3">Coming soon</Badge></section></TabsContent>
    </Tabs>
  </div></AppShell>;
}

export default function SettingsPage() {
  return <RequireAuth><SettingsContent/></RequireAuth>;
}
