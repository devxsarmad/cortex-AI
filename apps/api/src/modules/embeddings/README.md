# Embeddings Module

API module for the first manual embedding pipeline.

Current chunk:

- Cleans uploaded document text before processing.
- Splits text into overlapping character-based chunks with token estimates.
- Generates embeddings through an `EmbeddingClient` boundary.
- Uses OpenAI embeddings when `OPENAI_API_KEY` is configured.
- Falls back to deterministic mock embeddings for local development.

This module intentionally stores vectors in memory on the document record for now. Qdrant will replace that storage boundary in the vector database chunk.
