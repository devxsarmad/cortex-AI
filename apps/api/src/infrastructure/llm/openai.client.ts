import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { env } from "../../config/env.js";
import type { LlmClient, StreamCompletionInput } from "./llm.types.js";

export class OpenAiClient implements LlmClient {
  readonly provider = "openai";

  private readonly client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async *streamCompletion(input: StreamCompletionInput): AsyncIterable<string> {
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: input.systemPrompt },
      ...input.messages.map((message) => ({
        role: message.role,
        content: message.content
      }))
    ];

    const completion = await this.client.chat.completions.create({
      model: env.openaiModel,
      temperature: input.temperature,
      stream: true,
      messages
    });

    for await (const chunk of completion) {
      const token = chunk.choices[0]?.delta?.content;
      if (token) yield token;
    }
  }
}