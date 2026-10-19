"use client";
import { History, Search, Trash2, X } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RequireAuth } from "@/features/auth/AuthProvider";
import { useConversations } from "@/features/chat/hooks/useConversations";
export default function HistoryPage() {
  const { conversationsQuery, deleteMutation } = useConversations();
  const [search, setSearch] = useState("");
  const allConversations = conversationsQuery.data ?? [];
  const conversations = allConversations.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));

  return <RequireAuth><AppShell provider="openai"><div className="mx-auto max-w-4xl p-4 sm:p-6">
    <h2 className="text-page font-semibold">Conversation history</h2>
    <p className="mt-1 text-text-secondary">Find and manage previous conversations.</p>
    {allConversations.length > 0 && <div className="relative mt-6 w-full max-w-80">
      <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-2.5 z-10 h-4 w-4 text-text-muted"/>
      <Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 pl-8 pr-9" placeholder="Search conversations"/>
      {search && <button type="button" onClick={() => setSearch("")} className="focus-ring absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-control text-text-muted hover:bg-canvas hover:text-text-primary" aria-label="Clear search"><X className="h-4 w-4"/></button>}
    </div>}
    <div className="mt-4 space-y-2">{conversationsQuery.isPending ? <><Skeleton className="h-16"/><Skeleton className="h-16"/></> : allConversations.length === 0 ? <div className="flex min-h-40 flex-col items-center justify-center text-center"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-card bg-primary-soft text-primary"><History className="h-5 w-5" aria-hidden="true"/></div><h3 className="text-body font-semibold text-text-primary">No conversations yet</h3><p className="mt-1 text-small text-text-secondary">Your saved conversations will appear here.</p></div> : conversations.length === 0 ? <div className="flex items-center gap-2 py-3 text-small text-text-muted"><span>No conversations match your search.</span><Button variant="ghost" size="sm" onClick={() => setSearch("")}>Clear search</Button></div> : conversations.map((conversation) => <div key={conversation.id} className="flex items-center gap-4 rounded-card border border-border bg-surface p-4"><div className="min-w-0 flex-1"><p className="truncate font-medium">{conversation.title}</p><p className="mt-1 text-caption text-text-muted">{conversation.messageCount} messages · {new Date(conversation.updatedAt).toLocaleDateString()}</p></div><Dialog trigger={<Button variant="ghost" size="sm" aria-label={`Delete ${conversation.title}`}><Trash2 className="h-4 w-4"/></Button>} title="Delete conversation?" description="This conversation will be permanently removed." footer={<><DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose><DialogClose asChild><Button variant="danger" onClick={() => void deleteMutation.mutateAsync(conversation.id)}>Delete</Button></DialogClose></>}/></div>)}</div>
  </div></AppShell></RequireAuth>;
}
