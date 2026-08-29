export type StreamEventName = "meta" | "sources" | "tools" | "token" | "done" | "error";

export type StreamEvent<TData = unknown> = {
  event?: StreamEventName;
  data: TData;
};
