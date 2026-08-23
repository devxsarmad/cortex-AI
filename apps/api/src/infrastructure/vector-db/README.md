# Vector Database Infrastructure

Infrastructure boundary for vector upsert and semantic chunk search.

Current chunk:

- `VectorStore` interface owns upsert and search.
- Memory vector store is the default for local development.
- Qdrant vector store is available when `VECTOR_STORE_PROVIDER=qdrant`.
- Qdrant collection defaults to `cortex_chunks`.
- Qdrant URL defaults to `http://localhost:6333`.

Run Qdrant locally with:

```txt
npm run docker:up
```

Then set:

```txt
VECTOR_STORE_PROVIDER=qdrant
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=cortex_chunks
```
