# Embeddings Module

API module for the first manual embedding pipeline.

Current chunk:

- Cleans uploaded document text before processing.
- Splits text with LangChain `RecursiveCharacterTextSplitter` and keeps Cortex chunk metadata.
- Generates embeddings through an `EmbeddingClient` boundary.
- Uses OpenAI embeddings when `OPENAI_API_KEY` is configured.
- Falls back to deterministic mock embeddings for local development.

The document module stores generated vectors in the in-memory document repository for now. Qdrant will replace that vector storage boundary in the vector database chunk.
