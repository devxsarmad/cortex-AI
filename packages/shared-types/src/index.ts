export type ApiErrorResponse = {
  error: string;
  details?: unknown;
};

export type ChatRole = "user" | "assistant";

export type ChatMessageDto = {
  role: ChatRole;
  content: string;
};

export type StreamChatDto = {
  messages: ChatMessageDto[];
};
