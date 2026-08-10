export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type StreamChatRequest = {
  messages: ChatMessage[];
};

export type ChatStreamMeta = {
  provider: string;
};
