export type ServerSentEvent<TData = unknown> = {
  event: string;
  data: TData;
};
