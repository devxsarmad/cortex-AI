# Cortex AI - RAG And Agentic Knowledge Assistant

Cortex AI is a production-style AI knowledge assistant built to move from MERN development into real AI engineering: streaming LLM chat, document ingestion, embeddings, vector search, RAG, tool calling, and eventually LangGraph-based agent workflows.

The vision is strong, as long as Cortex stays focused: it should not be another medical scribe app. MediScribe AI proves healthcare workflow automation. Cortex AI should prove the reusable AI infrastructure behind modern assistants: retrieval, grounding, memory, tools, and agent orchestration.

## End Goal

Build a portfolio-ready AI assistant that can:

- Accept user questions through a polished chat interface.
- Upload and process documents such as PDFs, notes, manuals, policies, or knowledge-base files.
- Convert document chunks into embeddings.
- Store embeddings in a vector database.
- Retrieve the most relevant chunks for a user question.
- Generate grounded answers with source-aware context.
- Add tool calling for actions such as search, document lookup, metadata lookup, or future app-specific APIs.
- Upgrade from a fixed RAG pipeline into an agentic RAG system using LangGraph when routing and multi-step decisions are needed.

In simple words: Cortex AI is the project where RAG, Vector DB, embeddings, and agent orchestration become real code, not only resume keywords.

## Why This Project Matters

MediScribe AI and Cortex AI should tell one clean portfolio story:

- **MediScribe AI:** Healthcare AI workflow product. Audio to transcript, SOAP note generation, clinical review, ICD suggestions, safety checks.
- **Cortex AI:** General AI engineering platform. Embeddings, vector search, RAG, tool calling, memory, and agent graphs.

This split is good. It lets MediScribe stay practical and healthcare-focused while Cortex becomes the deeper AI architecture project.

## Current Status

Cortex AI currently has the foundation for a production-style monorepo:

- Next.js frontend app under `apps/web`.
- Express TypeScript API under `apps/api`.
- Shared packages under `packages`.
- Streaming chat endpoint structure.
- OpenAI/mock LLM boundary.
- Roadmap docs for chat, uploads, embeddings, vector DB, RAG, LangChain, LangGraph, tools, memory, and production features.
- Infrastructure folders already planned for database, vector DB, LLM, file storage, and queues.

This is the right base. The next important step is not more UI polish. The next step is building the document-to-vector-to-answer pipeline.

## Target Architecture

```txt
User Question
  -> Chat UI
  -> API Route
  -> RAG Orchestrator
  -> Query Embedding
  -> Vector DB Search
  -> Retrieved Context Chunks
  -> Prompt Builder
  -> LLM Answer
  -> Streamed Response
```

Document ingestion flow:

```txt
Upload Document
  -> Store Original File
  -> Extract Text
  -> Clean Text
  -> Split Into Chunks
  -> Generate Embeddings
  -> Store Vectors + Metadata
  -> Ready For Retrieval
```

Future agentic flow:

```txt
User Request
  -> LangGraph Agent
  -> Decide: answer directly, retrieve docs, call tool, ask clarification
  -> Execute selected node/tool
  -> Validate grounding
  -> Final answer with sources
```

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Feature-based UI structure

### Backend

- Node.js
- Express.js
- TypeScript
- Zod validation
- Server-sent events for streaming responses

### AI Layer

- OpenAI-compatible LLM client
- Mock LLM fallback for local development
- Embeddings service planned
- RAG orchestration planned
- LangChain planned only where it reduces boilerplate
- LangGraph planned for real agent routing

### Storage

- MongoDB planned for users, documents, chats, metadata, and audit trails
- Qdrant planned as the first vector database
- File storage planned for uploaded documents

## Monorepo Structure

```txt
apps/
  web/
    src/
      app/                 Next.js app routes
      components/          shared UI and layout components
      features/            feature-based frontend modules
      services/            browser API clients
      types/               frontend DTO types
      utils/               frontend helpers

  api/
    src/
      config/              environment config
      modules/
        chat/              current streaming chat module
        documents/         planned upload and text extraction module
        embeddings/        planned embedding generation module
        rag/               planned retrieval and answer orchestration
        agents/            planned LangGraph agent module
        users/             planned auth/user module
      infrastructure/
        llm/               OpenAI/mock provider boundary
        database/          planned MongoDB boundary
        vector-db/         planned Qdrant/Pinecone boundary
        storage/           planned file storage boundary
        queues/            planned background job boundary
      shared/              errors, middleware, constants, shared backend types

packages/
  shared-types/            shared DTO/domain types
  config/                  shared config constants

docs/
  chunks/                  build roadmap, brief concepts, and progress notes
```

## Roadmap

### Phase 1 - Chat Foundation

Goal: prove frontend-to-backend streaming and clean service boundaries.

- Chat UI
- Message state
- API client
- Streaming response
- OpenAI/mock LLM boundary

Status: foundation exists.

### Phase 2 - Document Upload

Goal: let users upload knowledge sources.

- Upload PDF or text file
- Validate file type and size
- Store file metadata
- Extract text
- Show uploaded documents in UI

### Phase 3 - Embeddings

Goal: convert text into searchable semantic vectors.

- Create chunking strategy
- Generate embeddings per chunk
- Store chunk text, embedding, document ID, page, and metadata
- Add retry/error handling for embedding calls

### Phase 4 - Vector Database

Goal: make documents semantically searchable.

- Add Qdrant with Docker
- Create vector collection
- Upsert document chunks
- Search top relevant chunks by query embedding
- Return source metadata

### Phase 5 - RAG

Goal: answer questions using retrieved context instead of only model memory.

- Embed user question
- Retrieve relevant chunks
- Build grounded prompt
- Stream answer
- Show source snippets
- Add fallback when retrieval confidence is weak

### Phase 6 - Multi-Document RAG

Goal: support real knowledge-base behavior.

- Filter by document, workspace, tag, or collection
- Rank chunks across multiple documents
- Add source citations
- Add context window management

### Phase 7 - LangChain Where Useful

Goal: learn LangChain without hiding the fundamentals.

- Keep manual RAG first
- Introduce LangChain for loaders, splitters, retrievers, or chains only after the manual pipeline is understood
- Compare manual implementation vs LangChain abstraction

### Phase 8 - Tool Calling

Goal: let the assistant call controlled backend tools.

- Define tool schemas
- Add tool execution layer
- Add audit logs
- Prevent direct DB access from the LLM
- Return tool results back into answer generation

### Phase 9 - LangGraph Agent

Goal: move from fixed RAG pipeline to decision-making workflow.

LangGraph should be used when the assistant needs to choose between steps, not just because it sounds advanced.

Example graph nodes:

- Classify user intent
- Decide whether retrieval is needed
- Retrieve documents
- Call tools
- Ask clarification
- Draft answer
- Validate grounding
- Final response

### Phase 10 - Agentic RAG

Goal: combine RAG, tools, memory, and validation.

The agent should be able to decide:

- Is this a general chat question?
- Is document retrieval required?
- Are retrieved chunks enough?
- Should it ask a follow-up question?
- Should it call a tool?
- Should it refuse or warn about missing evidence?

### Phase 11 - Memory

Goal: support useful continuity without polluting factual retrieval.

- Conversation memory
- User preferences
- Workspace-level context
- Clear separation between memory and source-grounded RAG

### Phase 12 - Production Features

Goal: make Cortex portfolio-ready.

- Auth
- Workspaces
- Rate limiting
- Logging
- Error boundaries
- Upload limits
- Evaluation tests
- Dockerized services
- Deployment docs

## What Cortex Should Not Become

To keep the project focused, Cortex should not become:

- Another MediScribe clone.
- A random chatbot with no retrieval.
- A UI-heavy project without AI depth.
- A LangChain/LangGraph wrapper before the manual RAG pipeline is understood.
- A project that claims RAG but does not show chunking, embeddings, vector search, citations, and retrieval quality handling.

## Portfolio Positioning

A clean resume/project description could be:

> Cortex AI is a full-stack RAG and agentic AI knowledge assistant built with Next.js, Express, TypeScript, OpenAI-compatible LLMs, embeddings, vector search, and a planned LangGraph workflow for tool-using retrieval agents.

What it demonstrates:

- Full-stack AI app architecture
- Streaming LLM UX
- Embedding and vector DB pipeline
- RAG orchestration
- Tool calling boundaries
- Agentic workflow planning
- Production-style monorepo structure

## Setup

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
npm run dev
```

The web app runs at `http://localhost:3000`.
The API runs at `http://localhost:4000`.

## Scripts

```bash
npm run dev       # run web and api together
npm run dev:web   # run only Next.js
npm run dev:api   # run only Express API
npm run lint
npm run typecheck
npm run build
npm run docker:up
npm run docker:down
```

## AI Provider

The backend is OpenAI-compatible. Add an API key in `apps/api/.env`:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
```

Without an API key, the API returns a local streaming fallback response so the app remains usable during development.

## Roadmap Docs

Chunk notes live in [`docs/chunks`](./docs/chunks/README.md). Each file tracks what is being built, current limits, and the next goal.

## Final Vision Check

Yes, the vision is good. Cortex AI is the correct next project after MediScribe because it fills the missing advanced AI pieces: vector databases, embeddings, RAG, retrieval quality, tool calling, and LangGraph.

The best path is to build it chunk by chunk, with working demos at every stage. First make manual RAG work clearly. Then add LangChain and LangGraph only when the code actually needs those abstractions.
