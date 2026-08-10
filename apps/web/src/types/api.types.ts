export type StreamEventName = "meta" | "token" | "done" | "error";

export type StreamEvent<TData = unknown> = {
  event?: StreamEventName;
  data: TData;
};
