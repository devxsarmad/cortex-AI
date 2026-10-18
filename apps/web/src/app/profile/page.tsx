"use client";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RequireAuth, useAuth } from "@/features/auth/AuthProvider";
function ProfileContent() { const { user } = useAuth(); if (!user) return null; return <AppShell provider="openai"><div className="mx-auto max-w-3xl p-4 sm:p-6"><div className="flex items-center gap-4"><Avatar name={user.name} className="h-12 w-12"/><div><h2 className="text-page font-semibold">Your profile</h2><p className="text-text-secondary">Personal details and workspace access.</p></div></div><section className="mt-6 rounded-card border border-border bg-surface p-card"><div className="grid gap-field sm:grid-cols-2"><Field label="Full name" htmlFor="profile-name"><Input id="profile-name" value={user.name} readOnly/></Field><Field label="Email" htmlFor="profile-email"><Input id="profile-email" value={user.email} readOnly/></Field><div><p className="text-small font-medium">Role</p><Badge tone="info" className="mt-2 capitalize">{user.role.toLowerCase()}</Badge></div><Field label="Organization" htmlFor="profile-org"><Input id="profile-org" value="Organization workspace" readOnly/></Field></div></section><section className="mt-4 rounded-card border border-border bg-surface p-card"><h3 className="text-section font-semibold">Password</h3><p className="mt-1 text-small text-text-secondary">Password changes require verification through your organization administrator.</p><Button variant="secondary" className="mt-4" disabled>Change password</Button></section></div></AppShell>; }
export default function ProfilePage() { return <RequireAuth><ProfileContent/></RequireAuth>; }
