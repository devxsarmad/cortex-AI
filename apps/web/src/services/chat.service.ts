import type { ChatMessage, ChatProviderMeta, ChatSource } from "@/features/chat/types/chat.types";

type StreamChatOptions = {
  messages: ChatMessage[];
  onToken: (token: string) => void;
  onMeta?: (meta: ChatProviderMeta) => void;
  onSources?: (sources: ChatSource[]) => void;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const parseSseBlock = (block: string) => {
  const event = block.match(/^event: (.+)$/m)?.[1];
  const data = block.match(/^data: (.+)$/m)?.[1];
  return {
    event,
    data: data ? JSON.parse(data) : null
  };
};

export const streamChat = async ({ messages, onToken, onMeta, onSources }: StreamChatOptions) => {
  const response = await fetch(`${API_URL}/api/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messages: messages.map(({ role, content }) => ({ role, content }))
    })
  });

  if (!response.ok || !response.body) {
    throw new Error("The chat API did not return a stream.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";

    for (const block of blocks) {
      if (!block.trim()) continue;

      const { event, data } = parseSseBlock(block);
      if (event === "token") onToken(data.token);
      if (event === "meta") onMeta?.(data);
      if (event === "sources") onSources?.(data.sources);
      if (event === "error") throw new Error(data.message);
    }
  }
};
