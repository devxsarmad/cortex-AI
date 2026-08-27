# Chat Module

API module for streaming chat responses.

Current chunk:

- Streams assistant responses through `POST /api/chat/stream`.
- Retrieves relevant uploaded document chunks for the latest user message.
- Supports optional document scoping with selected document IDs.
- Diversifies retrieved context so one document does not dominate every source slot.
- Injects retrieved chunks into the system prompt before calling the LLM.
- Sends source metadata through a `sources` SSE event.
- Falls back to a no-context prompt when no relevant chunks are available.
