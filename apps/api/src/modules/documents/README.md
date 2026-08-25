# Documents Module

API module for document ingestion.

Current chunk:

- `POST /api/documents` accepts one multipart file under the `file` field.
- `GET /api/documents` returns uploaded document metadata.
- `GET /api/documents/:id` returns metadata plus extracted text.
- `GET /api/documents/:id/chunks` returns generated chunks and embeddings.
- `POST /api/documents/search` embeds a query and returns top matching chunks.
- `POST /api/documents/:id/retry` reruns processing for failed documents with extracted text.
- `DELETE /api/documents/:id` removes the document metadata and its vector-store points.
- TXT, Markdown, JSON, and CSV files are extracted in memory.
- Extracted text is split into overlapping chunks and embedded through the embeddings module.
- Embedded chunks are upserted into the configured vector store before the document is marked `ready`.
- PDF uploads are accepted and marked `needs_parser` until a PDF extraction dependency is added.
- Current status flow is `uploaded` -> `processing` -> `ready` or `failed`, with `needs_parser` reserved for accepted files that cannot be extracted yet.

This module intentionally uses in-memory storage for now. MongoDB/file storage can replace the service internals without changing the route contract.
