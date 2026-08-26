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
            {message.role === "assistant" && message.sources && message.sources.length > 0 && (
              <div className="mt-3 border-t border-slate-200 pt-3">
                <p className="text-xs font-medium text-slate-600">Sources</p>
                <div className="mt-2 space-y-2">
                  {message.sources.map((source, index) => (
                    <div key={source.id} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-xs font-medium text-slate-700">
                          [S{index + 1}] {source.filename} chunk {source.chunkIndex}
                        </span>
                        <span className="text-xs text-slate-500">Score {source.score.toFixed(3)}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{source.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
