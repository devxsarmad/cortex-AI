import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { ConversationSummary } from "@/features/chat/types/conversation.types";

type AppShellProps = {
  provider: string;
  agentRoute: string;
  agentTraceCount: number;
  retrievalStrategy: string;
  retrievalQueryCount: number;
  conversations: ConversationSummary[];
  activeConversationId?: string;
  isLoadingConversations: boolean;
  onNewChat: () => void;
  onSelectConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  children: ReactNode;
};

export function AppShell({
  provider,
  agentRoute,
  agentTraceCount,
  retrievalStrategy,
  retrievalQueryCount,
  conversations,
  activeConversationId,
  isLoadingConversations,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  children
}: AppShellProps) {
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
            <span className="text-xs capitalize text-slate-500">
              Retrieval {retrievalStrategy.replaceAll("_", " ")} | {retrievalQueryCount} queries
            </span>
          </div>
        </header>

        <section className="grid flex-1 gap-5 py-5 lg:grid-cols-[320px_1fr]">
          <aside className="hidden border-r border-slate-200 pr-5 lg:block">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Workspace</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <Button className="w-full justify-start text-left" onClick={onNewChat}>
                  New chat
                </Button>
                <div>
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-normal text-slate-500">
                    Chat sessions
                  </h3>
                  <div className="space-y-2">
                    {isLoadingConversations && (
                      <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        Loading sessions...
                      </p>
                    )}
                    {!isLoadingConversations && conversations.length === 0 && (
                      <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        No saved chats yet.
                      </p>
                    )}
                    {!isLoadingConversations &&
                      conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className="flex items-center gap-2 rounded-md border border-slate-200 bg-white p-2"
                        >
                          <button
                            type="button"
                            onClick={() => onSelectConversation(conversation.id)}
                            className={`min-w-0 flex-1 text-left text-xs leading-5 ${
                              activeConversationId === conversation.id ? "text-clinical" : "text-slate-700"
                            }`}
                          >
                            <span className="block truncate font-medium">{conversation.title}</span>
                            <span className="text-slate-500">{conversation.messageCount} messages</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteConversation(conversation.id)}
                            className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-900">
              Conversations are saved in API memory for this chunk. Restarting the API clears them.
            </div>
          </aside>

          {children}
        </section>
      </div>
    </main>
  );
}
