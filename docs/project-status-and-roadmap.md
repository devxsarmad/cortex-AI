# Cortex AI Project Status And Roadmap

## Git Description

Cortex AI is a full-stack RAG and agentic AI knowledge assistant built with Next.js, Express, TypeScript, streaming LLM responses, OpenAI-compatible providers, and a planned document ingestion, embeddings, vector search, tool calling, and LangGraph agent workflow.

Short version:

```txt
Full-stack RAG and agentic AI knowledge assistant with streaming chat, document retrieval, vector search, and planned LangGraph workflows.
```

## Project Vision

Cortex AI is the project where we turn core AI engineering concepts into real working code. The goal is not only to build a chatbot, but to build the infrastructure behind a modern knowledge assistant:

- Streaming chat UX
- Document upload and parsing
- Chunking and embeddings
- Vector database search
- Retrieval-augmented generation
- Source-grounded answers
- Tool calling
- Agentic workflows with LangGraph
- Memory and production-ready app structure

This project should prove the deeper AI architecture layer: retrieval, grounding, orchestration, tools, and reliability.

## What We Have Developed So Far

### Monorepo Foundation

- Root workspace with `apps/*` and `packages/*`.
- Shared scripts for development, typechecking, linting, building, and Docker.
- Separate frontend and backend apps.
- Shared packages prepared for cross-app types and config.

Important files:

- `package.json`
- `apps/web/package.json`
- `apps/api/package.json`
- `packages/shared-types`
- `packages/config`

### Frontend Chat App

- Next.js app under `apps/web`.
- Feature-based chat structure.
- Chat screen with message list, prompt suggestions, and composer.
- Streaming assistant response handling in React state.
- API client for server-sent events.
- Provider display so we can see whether the backend is using mock or OpenAI.

Important files:

- `apps/web/src/app/page.tsx`
- `apps/web/src/components/layout/AppShell.tsx`
- `apps/web/src/features/chat/components/ChatView.tsx`
- `apps/web/src/features/chat/components/MessageList.tsx`
- `apps/web/src/features/chat/components/ChatComposer.tsx`
- `apps/web/src/features/chat/hooks/useChat.ts`
- `apps/web/src/services/chat.service.ts`

### Backend Chat API

- Express TypeScript API under `apps/api`.
- Streaming chat endpoint at `POST /api/chat/stream`.
- Server-sent event response format with `meta`, `token`, `done`, and `error` events.
- Zod request validation.
- Shared error handling and async middleware structure.

Important files:

- `apps/api/src/app.ts`
- `apps/api/src/server.ts`
- `apps/api/src/modules/chat/chat.routes.ts`
- `apps/api/src/modules/chat/chat.controller.ts`
- `apps/api/src/modules/chat/chat.service.ts`
- `apps/api/src/modules/chat/chat.validation.ts`

### LLM Provider Boundary

- OpenAI-compatible LLM client.
- Mock LLM fallback for local development without an API key.
- Provider abstraction so later RAG, tools, and agents can call the model through one boundary.

Important files:

- `apps/api/src/infrastructure/llm/llm.client.ts`
- `apps/api/src/infrastructure/llm/openai.client.ts`
- `apps/api/src/infrastructure/llm/mock.client.ts`
- `apps/api/src/infrastructure/llm/llm.types.ts`

### Planning Docs

- Chunk-based roadmap exists under `docs/chunks`.
- Each chunk now includes brief concept notes and progress notes in one place.
- Placeholder modules already exist for documents, embeddings, RAG, agents, users, database, vector DB, queues, and storage.

Important files:

- `docs/chunks/README.md`
- `docs/chunks/chunk-01-chat-application.md`

## Current Status

Current stage: **Chunk 01 complete: streaming chat foundation**.

The app can send a user message from the Next.js frontend to the Express backend and stream an assistant response back into the UI. The backend can use an OpenAI-compatible provider when configured, or a mock response during local development.

Current limits:

- Chat history is only in frontend state.
- No authentication yet.
- No database persistence yet.
- No document upload yet.
- No text extraction or chunking yet.
- No embeddings yet.
- No vector database retrieval yet.
- No RAG citations yet.
- No tool calling or agent workflow yet.

## Upcoming End Goal

The final version of Cortex AI should be a portfolio-ready AI knowledge assistant where a user can upload documents, ask questions, receive grounded answers with sources, and eventually rely on an agent workflow that decides when to retrieve documents, call tools, ask clarifying questions, or answer directly.

## Upcoming Development Stages

### Stage 2: Document Upload

Goal: let users upload files that become knowledge sources.

Build:

- Upload endpoint.
- Frontend upload UI.
- File validation for type and size.
- Original file storage boundary.
- Document metadata model.
- PDF/text extraction.
- Uploaded document list.

Success check:

- A user can upload a PDF or text file and see it registered in the app.
- The backend can extract readable text from the uploaded file.

### Stage 3: Embeddings

Goal: convert extracted text into semantic vectors.

Build:

- Text cleaning.
- Chunking strategy.
- Embedding client abstraction.
- Embedding generation per chunk.
- Chunk metadata with document ID, page, section, and token count.
- Retry and failure handling.

Success check:

- Every uploaded document can be split into chunks and converted into embeddings.

### Stage 4: Vector Database

Goal: make document chunks searchable by meaning.

Build:

- Qdrant service in Docker.
- Vector collection setup.
- Chunk upsert.
- Query embedding.
- Top-k semantic search.
- Source metadata return shape.

Success check:

- A search query returns the most relevant document chunks with document and location metadata.

### Stage 5: Manual RAG

Goal: answer using retrieved context, not only model memory.

Build:

- RAG orchestrator.
- Query embedding step.
- Vector search step.
- Prompt builder with retrieved context.
- Grounded answer generation.
- Streaming RAG response.
- Source snippets in frontend.
- Fallback when retrieval confidence is weak.

Success check:

- A user can ask a question about an uploaded document and receive an answer grounded in retrieved chunks.

### Stage 6: Multi-Document RAG

Goal: support realistic knowledge-base behavior.

Build:

- Search across multiple documents.
- Filtering by document, collection, tag, or workspace.
- Reranking or scoring improvements.
- Better citation formatting.
- Context window management.

Success check:

- Cortex can answer across multiple uploaded documents and cite the correct sources.

### Stage 7: LangChain Where Useful

Goal: learn LangChain after understanding the manual pipeline.

Build:

- Compare manual loaders, splitters, retrievers, and chains with LangChain equivalents.
- Adopt only the pieces that reduce boilerplate or improve reliability.
- Keep core architecture understandable.

Success check:

- We can explain what LangChain replaces and what our manual RAG code still owns.

### Stage 8: Tool Calling

Goal: let Cortex call controlled backend tools.

Build:

- Tool schema definitions.
- Tool execution layer.
- Permission and safety boundaries.
- Audit logs.
- Tool result injection into model responses.

Success check:

- Cortex can choose and call a backend tool without giving the model direct database or infrastructure access.

### Stage 9: LangGraph Agent

Goal: move from a fixed pipeline to a decision-making graph.

Build:

- Intent classification node.
- Retrieval decision node.
- Tool calling node.
- Clarification node.
- Answer drafting node.
- Grounding validation node.
- Final response node.

Success check:

- Cortex can decide whether to answer directly, retrieve documents, call a tool, or ask a follow-up.

### Stage 10: Agentic RAG

Goal: combine RAG, tools, memory, and validation.

Build:

- Multi-step retrieval.
- Tool-assisted answers.
- Grounding checks.
- Missing evidence handling.
- Source-aware final responses.

Success check:

- Cortex behaves like a reliable document-grounded assistant instead of a single-pass chatbot.

### Stage 11: Memory

Goal: support useful continuity without mixing memory with source-grounded facts.

Build:

- Conversation memory.
- User preferences.
- Workspace-level context.
- Clear boundary between memory and retrieved source evidence.

Success check:

- Cortex can remember useful user preferences while still grounding factual answers in documents.

### Stage 12: Production Readiness

Goal: make Cortex portfolio-ready and deployable.

Build:

- Authentication.
- Workspaces.
- Persistent chat/document storage.
- Rate limiting.
- Logging and monitoring.
- Upload limits.
- Error states.
- Evaluation tests.
- Deployment docs.

Success check:

- Cortex can be demoed as a polished, production-style AI engineering project.

## Immediate Next Step

The next best move is **Stage 2: Document Upload**.

The first implementation target should be:

1. Add a backend document upload route.
2. Validate uploaded files.
3. Store document metadata.
4. Extract text from one supported format first.
5. Add a simple frontend upload panel.

Once upload and extraction are working, embeddings and vector search become the natural next layer.
