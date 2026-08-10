import { cn } from "@/utils/cn";
import type { ChatMessage } from "../types/chat.types";

type MessageListProps = {
  messages: ChatMessage[];
};

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        Start a conversation to see responses here.
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      {messages.map((message) => (
        <article key={message.id} className={cn("flex", message.role === "user" && "justify-end")}>
          <div
            className={cn(
              "max-w-[82%] rounded-lg px-4 py-3 text-sm leading-6 shadow-sm",
              message.role === "user"
                ? "bg-clinical text-white"
                : "border border-slate-200 bg-slate-50 text-ink"
            )}
          >
            <p className="whitespace-pre-wrap">{message.content || "..."}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
