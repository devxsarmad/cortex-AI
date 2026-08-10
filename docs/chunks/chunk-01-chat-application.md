# Chunk 01: Chat Application

## Status

Completed.

## Goal

Build the first production-style chat experience with a frontend, backend API, AI provider integration point, and streaming responses.

## What We Did

- Created a monorepo with `apps/web` and `apps/api`.
- Built a Next.js chat interface for Cortex AI.
- Built an Express TypeScript backend.
- Added `POST /api/chat/stream` for streaming chat responses over server-sent events.
- Added an OpenAI-compatible chat service.
- Added a local mock stream fallback for development without an API key.
- Added a healthcare-focused system prompt.
- Added request validation with Zod.
- Added TypeScript, ESLint, and production build scripts.

## Concepts This Chunk Teaches

- Chat completions: the backend sends structured `system`, `user`, and `assistant` messages to an LLM.
- System prompting: Cortex gets stable behavior rules before the user message is sent.
- Temperature: model randomness is controlled through environment config.
- Token streaming: the model response arrives piece by piece instead of waiting for the full answer.
- Server-sent events: the API forwards streamed tokens to the browser as events.
- Provider abstraction: OpenAI and mock responses use the same backend interface.
- Validation: Zod protects the chat endpoint from invalid message shapes.

## Request Flow

```txt
User message
  -> Next.js chat UI
  -> frontend stream client
  -> Express chat route
  -> Zod validation
  -> chat service
  -> OpenAI or mock LLM client
  -> streamed tokens
  -> browser UI update
```

## Important Files

- `apps/web/src/features/chat/components/ChatView.tsx`
- `apps/web/src/features/chat/hooks/useChat.ts`
- `apps/web/src/services/chat.service.ts`
- `apps/api/src/app.ts`
- `apps/api/src/server.ts`
- `apps/api/src/modules/chat/chat.routes.ts`
- `apps/api/src/modules/chat/chat.controller.ts`
- `apps/api/src/modules/chat/chat.service.ts`
- `apps/api/src/modules/chat/chat.validation.ts`
- `apps/api/src/infrastructure/llm/llm.client.ts`
- `apps/api/src/infrastructure/llm/openai.client.ts`

## Verification

Run:

```bash
npm run typecheck
npm run lint
npm run build
```

Manual check:

```bash
npm run dev
```

Open `http://localhost:3000` and send a chat message.

## Current Limitations

- Chat history is only stored in browser state.
- No authentication.
- No database persistence.
- No document upload.
- No RAG or citations yet.
- No real model response until `OPENAI_API_KEY` is configured.

## Next Goal

Chunk 02 will add PDF upload and text extraction so the assistant can accept healthcare documents as source material.
