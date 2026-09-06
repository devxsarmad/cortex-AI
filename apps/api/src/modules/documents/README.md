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
- TXT, Markdown, JSON, CSV, and text-based PDF files are extracted in memory.
- PDF text is parsed with `pdf-parse`, then follows the same chunk, embed, and vector upsert path as other files.
- Extracted text is split into overlapping chunks and embedded through the embeddings module.
- Embedded chunks are upserted into the configured vector store before the document is marked `ready`.
- Scanned or image-only PDFs fail with a clear message because OCR is not implemented yet.
- Current status flow is `uploaded` -> `processing` -> `ready` or `failed`. `needs_parser` stays in the type union for older records and future parsers such as OCR.

This module intentionally uses in-memory storage for now. MongoDB/file storage can replace the service internals without changing the route contract.
