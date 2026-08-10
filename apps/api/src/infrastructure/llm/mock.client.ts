import type { LlmClient, StreamCompletionInput } from "./llm.types.js";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockLlmClient implements LlmClient {
  readonly provider = "mock";

  async *streamCompletion(input: StreamCompletionInput): AsyncIterable<string> {
    const lastUserMessage = [...input.messages].reverse().find((message) => message.role === "user");
    const text = [
      "Cortex is running in local mode because no AI provider key is configured.",
      "",
      "The chat service is online and streaming responses, but a real model response requires OPENAI_API_KEY in the API environment.",
      "",
      lastUserMessage?.content
        ? `Your question was: "${lastUserMessage.content}".`
        : "Send a healthcare research question to test the chat flow."
    ].join("\n");

    for (const token of text.split(/(\s+)/)) {
      yield token;
      await sleep(28);
    }
  }
}
