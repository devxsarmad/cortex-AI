"use client";

import { Check, Copy, MailPlus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/AuthProvider";
import { memberApi, type Invitation } from "@/services/member.service";

export function MemberPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [invitation, setInvitation] = useState<Invitation>();
  const [copied, setCopied] = useState(false);
  const members = useQuery({ queryKey: ["members"], queryFn: memberApi.list });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["members"] });
  const invite = useMutation({
    mutationFn: () => memberApi.invite(email, role),
    onSuccess: (result) => { setInvitation(result); setEmail(""); setCopied(false); }
  });
  const change = useMutation({
    mutationFn: ({ id, nextRole }: { id: string; nextRole: "OWNER" | "ADMIN" | "MEMBER" }) => memberApi.changeRole(id, nextRole),
    onSuccess: refresh
  });
  const remove = useMutation({ mutationFn: memberApi.remove, onSuccess: refresh });
  const copyInvitation = async () => {
    if (!invitation) return;
    await navigator.clipboard.writeText(invitation.inviteUrl);
    setCopied(true);
  };

  return <div className="space-y-5">
    <section className="rounded-card border border-border bg-surface p-card">
      <div className="flex items-start gap-3"><span className="rounded-control bg-primary-soft p-2 text-primary"><MailPlus className="h-4 w-4"/></span><div><h3 className="text-section font-semibold">Invite a teammate</h3><p className="mt-1 text-small text-text-secondary">Create a secure, seven-day invitation link for their email address.</p></div></div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row"><Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="colleague@example.com"/><div className="sm:w-40"><Select ariaLabel="Invitation role" value={role} onValueChange={(value) => setRole(value as typeof role)}><SelectItem value="MEMBER">Member</SelectItem><SelectItem value="ADMIN">Admin</SelectItem></Select></div><Button onClick={() => invite.mutate()} disabled={!email} loading={invite.isPending}>Create invite</Button></div>
      {invite.error && <p className="mt-3 rounded-control bg-danger-soft px-3 py-2 text-small text-danger">{invite.error.message}</p>}
      {invitation && <div className="mt-4 rounded-control border border-success/20 bg-success-soft p-3"><div className="flex items-center gap-2"><Check className="h-4 w-4 text-success"/><p className="text-small font-medium">Invite ready for {invitation.email}</p></div><p className="mt-1 text-caption text-text-secondary">Send this link to the invited {invitation.role.toLowerCase()}. It expires {new Date(invitation.expiresAt).toLocaleDateString()}.</p><div className="mt-3 flex gap-2"><Input value={invitation.inviteUrl} readOnly className="font-mono text-caption"/><Button variant="secondary" onClick={() => void copyInvitation()}><Copy className="h-4 w-4"/>{copied ? "Copied" : "Copy link"}</Button></div></div>}
    </section>

    <section className="rounded-card border border-border bg-surface p-card">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="rounded-control bg-canvas p-2 text-text-secondary"><Users className="h-4 w-4"/></span><div><h3 className="text-section font-semibold">Workspace members</h3><p className="text-small text-text-secondary">Roles take effect on the member’s next sign-in.</p></div></div>{members.data && <Badge tone="info">{members.data.length} members</Badge>}</div>
      {(change.error || remove.error) && <p className="mt-3 rounded-control bg-danger-soft px-3 py-2 text-small text-danger">{change.error?.message ?? remove.error?.message}</p>}
      <div className="mt-4 divide-y divide-border">{members.isPending ? <><Skeleton className="h-16"/><Skeleton className="mt-2 h-16"/></> : members.error ? <p className="py-4 text-small text-danger">{members.error.message}</p> : members.data?.map((member) => {
        const protectedOwner = member.role === "OWNER" && user?.role !== "OWNER";
        return <div key={member.id} className="flex flex-wrap items-center gap-3 py-3"><div className="min-w-48 flex-1"><p className="truncate font-medium">{member.name}{member.id === user?.id && <span className="ml-2 text-caption font-normal text-text-muted">You</span>}</p><p className="truncate text-small text-text-muted">{member.email}</p></div><div className="w-32"><Select ariaLabel={`Role for ${member.name}`} value={member.role} disabled={protectedOwner || member.id === user?.id || change.isPending} onValueChange={(nextRole) => change.mutate({ id: member.id, nextRole: nextRole as typeof member.role })}><SelectItem value="MEMBER">Member</SelectItem><SelectItem value="ADMIN">Admin</SelectItem>{user?.role === "OWNER" && <SelectItem value="OWNER">Owner</SelectItem>}</Select></div>{member.id !== user?.id && <Button variant="ghost" size="sm" disabled={protectedOwner || remove.isPending} onClick={() => remove.mutate(member.id)}><Trash2 className="h-4 w-4"/>Remove</Button>}</div>;
      })}</div>
    </section>
  </div>;
}
