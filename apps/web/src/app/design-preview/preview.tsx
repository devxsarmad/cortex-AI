"use client";

import { FileText, MoreHorizontal, Plus, Settings, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge, StatusPill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { DropdownItem, DropdownMenu, DropdownSeparator } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, HelperText, InlineError, Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toast, ToastProvider, ToastViewport } from "@/components/ui/toast";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";

const swatches = [
  ["Primary", "bg-primary"], ["Primary soft", "bg-primary-soft"], ["Ink", "bg-ink"], ["Canvas", "bg-canvas"],
  ["Surface", "bg-surface"], ["Border", "bg-border"], ["Success", "bg-success"], ["Warning", "bg-warning"], ["Danger", "bg-danger"], ["Info", "bg-info"]
];

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="rounded-card border border-border bg-surface p-card"><div className="mb-5 border-b border-border pb-4"><h2 className="text-section font-semibold text-text-primary">{title}</h2><p className="mt-1 text-small text-text-secondary">{description}</p></div>{children}</section>;
}

export function DesignPreview() {
  const [status, setStatus] = useState("ready");
  const [toastOpen, setToastOpen] = useState(false);
  return <ToastProvider swipeDirection="right"><TooltipProvider><main className="min-h-screen bg-canvas">
    <header className="border-b border-border bg-surface"><div className="mx-auto flex max-w-6xl items-center justify-between px-page py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-control bg-ink text-body font-semibold text-text-on-brand">C</div><div><p className="font-semibold text-text-primary">Cortex AI</p><p className="text-caption text-text-muted">Clinical design system · Phase 1</p></div></div><Badge tone="success">Foundations ready</Badge></div></header>
    <div className="mx-auto max-w-6xl space-y-6 p-page"><div className="max-w-2xl py-4"><p className="mb-2 text-small font-medium text-primary">Design preview</p><h1 className="text-page font-semibold text-text-primary">A calm, precise interface for healthcare teams</h1><p className="mt-2 text-body-large text-text-secondary">Token-driven foundations and accessible components for every Cortex AI workflow.</p></div>

      <Section title="Color and type" description="Semantic tokens keep contrast and hierarchy predictable across the product."><div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{swatches.map(([name, color]) => <div key={name}><div className={`h-12 rounded-control border border-border ${color}`} /><p className="mt-1.5 text-caption text-text-secondary">{name}</p></div>)}</div><div className="mt-6 grid gap-4 border-t border-border pt-5 md:grid-cols-2"><div className="space-y-2"><p className="text-auth font-semibold text-text-primary">Auth heading</p><p className="text-page font-semibold text-text-primary">Page title</p><p className="text-section font-semibold text-text-primary">Section title</p><p className="text-body-large text-text-primary">Body large for useful emphasis.</p><p className="text-body text-text-secondary">Body copy stays compact and highly readable.</p><p className="text-small text-text-secondary">Small supporting information</p><p className="text-caption text-text-muted">Caption and metadata</p></div><div className="rounded-card border border-border bg-canvas p-4 font-mono text-small text-text-secondary"><p>northwind-clinic/handbook.pdf</p><p className="mt-2">source_id: chunk_01HZX83F</p><p className="mt-2 text-primary">[1] pages 14–15</p></div></div></Section>

      <Section title="Buttons and feedback" description="One restrained action system with visible focus, loading, disabled, and destructive states."><div className="flex flex-wrap items-center gap-3"><Button><Plus className="h-4 w-4" strokeWidth={1.75} />Primary</Button><Button variant="secondary"><Upload className="h-4 w-4" strokeWidth={1.75} />Secondary</Button><Button variant="ghost">Ghost</Button><Button variant="danger"><Trash2 className="h-4 w-4" strokeWidth={1.75} />Delete</Button><Button size="sm">Compact</Button><Button loading>Saving</Button><Button disabled>Disabled</Button></div><div className="mt-5 flex flex-wrap items-center gap-3"><Tooltip content="Organization settings"><Button variant="secondary" size="sm" aria-label="Organization settings"><Settings className="h-4 w-4" strokeWidth={1.75} /></Button></Tooltip><DropdownMenu trigger={<Button variant="secondary" size="sm"><MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />Actions</Button>}><DropdownItem>Download</DropdownItem><DropdownItem>Retry processing</DropdownItem><DropdownSeparator /><DropdownItem danger>Delete document</DropdownItem></DropdownMenu><Dialog trigger={<Button variant="secondary">Open dialog</Button>} title="Delete document?" description="This action cannot be undone. The document and its indexed chunks will be removed." footer={<><DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose><DialogClose asChild><Button variant="danger">Delete document</Button></DialogClose></>} /><Button variant="secondary" onClick={() => setToastOpen(true)}>Show toast</Button></div></Section>

      <Section title="Form controls" description="Labels, guidance, errors, and password visibility use a consistent field pattern."><div className="grid max-w-3xl gap-field md:grid-cols-2"><Field label="Work email" htmlFor="preview-email" helper="Use the address associated with your clinic."><Input id="preview-email" type="email" placeholder="name@clinic.org" /></Field><Field label="Password" htmlFor="preview-password" helper="At least 10 characters."><Input id="preview-password" type="password" revealable defaultValue="cortex-demo" /></Field><Field label="Organization" htmlFor="preview-org" error="Organization name is required."><Input id="preview-org" aria-invalid="true" placeholder="Clinic or laboratory name" /></Field><div className="space-y-1.5"><Label>Document status</Label><Select value={status} onValueChange={setStatus} ariaLabel="Document status"><SelectItem value="ready">Ready</SelectItem><SelectItem value="processing">Processing</SelectItem><SelectItem value="failed">Failed</SelectItem></Select><HelperText>Filter documents by processing state.</HelperText></div><div className="md:col-span-2"><Field label="Notes" htmlFor="preview-notes"><Textarea id="preview-notes" placeholder="Add context for your team…" /></Field></div></div><div className="mt-4"><InlineError>We couldn’t save your changes. Try again.</InlineError></div></Section>

      <Section title="Status, identity, and loading" description="Compact signals communicate state without adding visual noise."><div className="flex flex-wrap items-center gap-3"><StatusPill status="Queued" /><StatusPill status="Processing" /><StatusPill status="Ready" /><StatusPill status="Failed" /><Badge tone="warning">Needs review</Badge><Avatar name="Maya Chen" /><Avatar name="Omar Farooq" /></div><div className="mt-6 max-w-md space-y-3"><Skeleton className="h-4 w-2/5" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-4/5" /></div></Section>

      <Section title="Tabs and table" description="Shared navigation and data-density patterns for settings and documents."><Tabs defaultValue="general"><TabsList><TabsTrigger value="general">General</TabsTrigger><TabsTrigger value="security">Security</TabsTrigger></TabsList><TabsContent value="general"><TableContainer><Table><TableHead><TableRow><TableHeader>Name</TableHeader><TableHeader>Status</TableHeader><TableHeader>Uploaded</TableHeader></TableRow></TableHead><TableBody><TableRow><TableCell className="font-mono text-small">clinic-handbook.pdf</TableCell><TableCell><StatusPill status="Ready" /></TableCell><TableCell className="text-text-secondary">Today, 09:42</TableCell></TableRow><TableRow><TableCell className="font-mono text-small">lab-protocols.docx</TableCell><TableCell><StatusPill status="Processing" /></TableCell><TableCell className="text-text-secondary">Today, 09:37</TableCell></TableRow></TableBody></Table></TableContainer></TabsContent><TabsContent value="security"><p className="text-small text-text-secondary">Security settings use the same calm field and section patterns.</p></TabsContent></Tabs></Section>

      <Section title="Empty state" description="Useful, concise guidance with a single clear next action."><EmptyState icon={FileText} title="No documents yet" description="Upload a clinical handbook, protocol, or policy to start asking source-cited questions." action={<Button><Upload className="h-4 w-4" strokeWidth={1.75} />Upload document</Button>} /></Section>
    </div>
  </main><Toast open={toastOpen} onOpenChange={setToastOpen} title="Document uploaded" description="Processing has started. We’ll update the status here." /><ToastViewport /></TooltipProvider></ToastProvider>;
}
