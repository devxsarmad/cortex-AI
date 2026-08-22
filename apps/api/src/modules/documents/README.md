# Documents Module

API module for document ingestion.

Current chunk:

- `POST /api/documents` accepts one multipart file under the `file` field.
- `GET /api/documents` returns uploaded document metadata.
- `GET /api/documents/:id` returns metadata plus extracted text.
- `GET /api/documents/:id/chunks` returns generated chunks and embeddings.
- TXT, Markdown, JSON, and CSV files are extracted in memory.
- Extracted text is split into overlapping chunks and embedded through the embeddings module.
- PDF uploads are accepted and marked `needs_parser` until a PDF extraction dependency is added.

This module intentionally uses in-memory storage for now. MongoDB/file storage can replace the service internals without changing the route contract.
