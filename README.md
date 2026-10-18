# Cortex AI

Cortex AI is a full-stack RAG and agentic knowledge assistant built with Next.js, Express, TypeScript, OpenAI, embeddings, vector search, and LangGraph. It can ingest local documents, retrieve relevant evidence, execute controlled backend tools, and stream source-aware answers to the browser.

The project is a learning and portfolio platform for reusable AI infrastructure: retrieval, grounding, memory, tools, agent routing, observability, and production-minded service boundaries.

## Current Status

The core assistant workflow is implemented end to end.

- Streaming chat with an OpenAI provider and a mock fallback.
- Provider health detection when the web app loads.
- Local workspaces separated by a browser-generated owner ID.
- Saved chat sessions that can be restored and deleted.
- TXT, Markdown, JSON, CSV, and text-based PDF uploads up to 5 MB.
- Text extraction, format-aware chunking, embeddings, and retryable document processing.
- In-memory or Qdrant vector search.
- Single-query, multi-query, and comparison retrieval plans.
- Source snippets attached to grounded answers.
- A LangGraph workflow that routes between retrieval, tools, or both.
- Controlled calculator, current-time, and document-statistics tools.
- Agent route, trace count, retrieval strategy, and query count shown in the UI.
- Usage tracking, request logging, API-key authentication, rate limiting, validation, and security headers.
- JSON-file persistence for documents and conversations during local development.
- Docker services for the web app, API, Qdrant, and MongoDB.

MongoDB is included as planned infrastructure but is not currently the active application repository. Local JSON files remain the source of truth for document metadata and conversations.

## How It Works

### Chat and agent flow

```text
User message
  -> POST /api/chat/stream
  -> LangGraph request planner
  -> Choose: retrieve, tools, retrieve + tools, or direct response
  -> Build grounded system prompt
  -> OpenAI or mock LLM
  -> Stream metadata, sources, tool results, tokens, and completion over SSE
  -> Save the conversation
```

### Document ingestion flow

```text
Upload document
  -> Validate type and 5 MB size limit
  -> Extract text
  -> Split text into chunks
  -> Generate OpenAI or mock embeddings
  -> Store vectors in memory or Qdrant
  -> Persist document metadata locally
  -> Mark the source ready for retrieval
```

### Retrieval flow

```text
Question
  -> Build one or more retrieval queries
  -> Embed each query
  -> Search the selected documents
  -> Merge and limit source chunks
  -> Add evidence and tool output to the prompt
  -> Generate a source-aware answer
```

## Tech Stack

### Web

- Next.js 15 and React 19
- TypeScript
- Tailwind CSS
- Fetch-based API services
- Server-sent event consumption for streamed chat

### API and AI

- Node.js and Express
- TypeScript and Zod
- OpenAI chat completions and embeddings
- Mock LLM and deterministic mock embeddings for keyless development
- LangGraph state-machine orchestration
- Qdrant or in-memory vector storage
- `pdf-parse` for text-based PDFs
- JSON-file persistence

### Operational boundaries

- Optional shared API key
- Per-workspace request ownership
- Request IDs and request logging
- Rate limiting
- Security headers and environment-aware CORS
- Token and estimated-cost usage reporting

## Repository Structure

```text
apps/
  web/
    src/
      app/                    Next.js routes and metadata
      components/             shared layout and UI components
      features/chat/          chat state, composer, messages, and sessions
      features/documents/     upload, selection, retry, and deletion UI
      services/               health, chat, document, and conversation clients

  api/
    src/
      config/                 validated environment configuration
      modules/agents/         LangGraph routing workflow
      modules/chat/           SSE chat endpoint and prompt construction
      modules/conversations/  workspace-scoped conversation persistence
      modules/documents/      upload, extraction, chunking, and search
      modules/embeddings/     OpenAI/mock embedding clients and chunker
      modules/rag/            retrieval and grounded prompt orchestration
      modules/tools/          calculator, time, and document-statistics tools
      modules/ops/            usage reporting
      infrastructure/llm/     OpenAI/mock LLM boundary
      infrastructure/vector-db/ in-memory/Qdrant boundary
      infrastructure/storage/ local JSON persistence
      shared/                 middleware, errors, constants, and request helpers

packages/
  config/                     shared configuration package
  shared-types/               shared DTO and domain types
```

## Prerequisites

- Node.js 20 or newer
- npm
- An OpenAI API key for real chat and embeddings (optional)
- Docker if using Qdrant or the containerized stack (optional)

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create local environment files:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   ```

3. Add `OPENAI_API_KEY` to `apps/api/.env` if you want real OpenAI responses and embeddings. Leave it empty to use the local mock providers.

4. Start both applications:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000). The API runs at [http://localhost:4000](http://localhost:4000), and its health endpoint is [http://localhost:4000/health](http://localhost:4000/health).

The header checks API health on page load and shows `OpenAI`, `Mock`, or `Not Connected` before the first message is sent.

> Do not run `npm run build` while a Next.js development server is active. Both commands write to `apps/web/.next`, and concurrent use can produce missing-chunk runtime errors.

## Environment Variables

### API (`apps/api/.env`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | Express API port |
| `NODE_ENV` | `development` | Runtime environment |
| `CLIENT_ORIGIN` | `http://localhost:3000` | Allowed production web origin; development reflects the requesting local origin |
| `OPENAI_API_KEY` | empty | Enables OpenAI chat and embeddings; empty uses mock providers |
| `OPENAI_MODEL` | `gpt-4.1-mini` | Chat model |
| `OPENAI_EMBEDDING_MODEL` | `text-embedding-3-small` | Embedding model |
| `AI_TEMPERATURE` | `0.3` | Chat generation temperature |
| `CORTEX_API_KEY` | empty | Optional API key required through `x-cortex-api-key` |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate-limit window |
| `RATE_LIMIT_MAX_REQUESTS` | `120` | Requests allowed per window |
| `AI_INPUT_COST_PER_1K_TOKENS` | `0` | Optional input-cost estimate |
| `AI_OUTPUT_COST_PER_1K_TOKENS` | `0` | Optional output-cost estimate |
| `CORTEX_DATA_DIR` | `.cortex-data` | Local JSON persistence directory |
| `VECTOR_STORE_PROVIDER` | `memory` | `memory` or `qdrant` |
| `QDRANT_URL` | `http://localhost:6333` | Qdrant HTTP endpoint |
| `QDRANT_COLLECTION` | `cortex_chunks` | Qdrant collection name |

### Web (`apps/web/.env.local`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Browser-facing API URL |
| `NEXT_PUBLIC_CORTEX_API_KEY` | empty | Must match `CORTEX_API_KEY` when API-key auth is enabled |

## Vector Storage

The default `memory` provider requires no additional service. Its vectors are rebuilt from persisted documents when the API starts.

To use Qdrant:

```bash
npm run docker:up
```

Then set:

```env
VECTOR_STORE_PROVIDER=qdrant
QDRANT_URL=http://localhost:6333
```

Qdrant data is persisted in the Docker volume declared in `docker-compose.yml`.

## Supported Documents

| Format | Extensions | Notes |
| --- | --- | --- |
| Plain text | `.txt` | Direct text extraction |
| Markdown | `.md`, `.markdown` | Direct text extraction |
| JSON | `.json` | Treated as readable text |
| CSV | `.csv` | Format-aware chunking |
| PDF | `.pdf` | Text extraction only |

Uploads are limited to one file per request and 5 MB per file. Scanned or image-only PDFs are not supported because OCR has not been added yet.

## Built-in Tools

The LangGraph workflow can execute these controlled backend tools:

- `calculator`: evaluates basic arithmetic with `+`, `-`, `*`, `/`, and parentheses.
- `current_time`: returns the current date and time.
- `document_stats`: reports workspace document, chunk, embedding-provider, and vector-store counts.

Tool selection is currently deterministic and keyword/rule based. The LLM receives tool results but cannot directly access the database or execute arbitrary code.

## API Overview

All `/api/*` endpoints are workspace-scoped through the `x-cortex-user-id` header. The web app creates and stores this ID automatically.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | API and provider health |
| `POST` | `/api/chat/stream` | Stream an agent response over SSE |
| `GET` | `/api/documents` | List workspace documents |
| `POST` | `/api/documents` | Upload and process a document |
| `POST` | `/api/documents/search` | Search document vectors |
| `GET` | `/api/documents/:id` | Get document details |
| `GET` | `/api/documents/:id/chunks` | List extracted chunks |
| `POST` | `/api/documents/:id/retry` | Retry failed processing |
| `DELETE` | `/api/documents/:id` | Delete a document and its vectors |
| `GET` | `/api/conversations` | List saved conversations |
| `POST` | `/api/conversations` | Create a conversation |
| `GET` | `/api/conversations/:id` | Restore a conversation |
| `PUT` | `/api/conversations/:id/messages` | Save messages and selected documents |
| `DELETE` | `/api/conversations/:id` | Delete a conversation |
| `GET` | `/api/ops/usage` | Return token and estimated-cost usage |

## Scripts

```bash
npm run dev          # run the API and web development servers
npm run dev:web      # run only Next.js
npm run dev:api      # run only the Express API
npm run typecheck    # type-check every workspace
npm run lint         # lint every workspace
npm run build        # production build for API and web
npm run docker:up    # start the Docker services
npm run docker:down  # stop the Docker services
```

## Current Limitations

- Local workspace identity is browser-generated; there is no account authentication yet.
- Documents and conversations use local JSON persistence rather than MongoDB.
- In-memory vector search is single-process; use Qdrant for durable vector storage.
- Tool planning is rule based rather than model-selected.
- PDF OCR, background queues, automated evaluation, and a production deployment guide are not implemented yet.
- The project does not provide medical advice and should not be treated as a clinical system.

## Next Priorities

1. Add automated tests and retrieval-quality evaluations.
2. Replace local workspace IDs with authenticated users and workspaces.
3. Move metadata and conversation repositories to MongoDB.
4. Add background document-processing jobs and durable file storage.
5. Add OCR for scanned PDFs.
6. Improve agent planning, grounding checks, citations, and failure recovery.
7. Add deployment, monitoring, and production operations documentation.

## Project Positioning

> Cortex AI is a full-stack RAG and agentic knowledge assistant built with Next.js, Express, TypeScript, OpenAI, embeddings, Qdrant-compatible vector search, controlled tool execution, and LangGraph orchestration.

It demonstrates the complete path from document ingestion and semantic retrieval to grounded streaming answers, persistent conversations, observable agent routing, and production-minded API boundaries.
