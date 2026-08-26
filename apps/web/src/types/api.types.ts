export type StreamEventName = "meta" | "sources" | "token" | "done" | "error";

export type StreamEvent<TData = unknown> = {
  event?: StreamEventName;
  data: TData;
};
