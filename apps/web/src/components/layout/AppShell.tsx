import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type AppShellProps = {
  provider: string;
  agentRoute: string;
  agentTraceCount: number;
  children: ReactNode;
};

export function AppShell({ provider, agentRoute, agentTraceCount, children }: AppShellProps) {
  return (
    <main className="min-h-screen bg-[#f5f7f7] text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Cortex AI</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
              Knowledge assistant for grounded answers, document retrieval, and agent workflows.
            </p>
          </div>
          <div className="flex flex-col gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm sm:items-end">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
              <span className="capitalize">{provider}</span>
            </div>
            <span className="text-xs capitalize text-slate-500">
              Route {agentRoute.replaceAll("_", " ")} | {agentTraceCount} steps
            </span>
          </div>
        </header>

        <section className="grid flex-1 gap-5 py-5 lg:grid-cols-[320px_1fr]">
          <aside className="hidden border-r border-slate-200 pr-5 lg:block">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Workspace</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <Button className="w-full justify-start text-left">New chat</Button>
                <Button variant="secondary" className="w-full text-left">
                  Knowledge base
                </Button>
                <Button variant="secondary" className="w-full text-left">
                  Retrieval test
                </Button>
                <Button variant="secondary" className="w-full text-left">
                  Agent trace
                </Button>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-900">
              Upload text sources first, then connect embeddings and vector search in the next
              pipeline chunk.
            </div>
          </aside>

          {children}
        </section>
      </div>
    </main>
  );
}
