# RAG Module

Retrieval-augmented generation utilities for Cortex chat and agent workflows.

Current behavior:

- Retrieves document chunks from the active vector store.
- Filters low-confidence matches before prompt injection.
- Limits per-document source dominance.
- Supports agentic multi-query retrieval plans.
- Merges duplicate chunks across planned queries while preserving matched query labels.

Module for retrieval and grounded answer generation.

Current chunk:

- Owns retrieval source selection for chat.
- Searches the document vector store through the existing document service.
- Filters weak matches by score.
- Diversifies source slots across documents.
- Builds the RAG system prompt through a LangChain prompt template.

Manual Cortex code still owns embeddings, vector storage, and streaming. LangChain is introduced only for prompt templates and text splitting where it reduces boilerplate.
