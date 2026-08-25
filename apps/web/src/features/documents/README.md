# Documents Feature

Frontend document ingestion surface.

Current chunk:

- Uploads one document to `POST /api/documents`.
- Lists uploaded document metadata from `GET /api/documents`.
- Shows basic status, size, and extracted character count.
- Shows generated chunk count and embedding provider.
- Understands upload, processing, ready, parser-needed, and failed states.
- Provides a retrieval test search box backed by `POST /api/documents/search`.
- Removes uploaded sources with `DELETE /api/documents/:id`.
- Accepts TXT, Markdown, JSON, CSV, and PDF to match the API.

The retrieval test search box is temporary for validating vector search before RAG. Once chat calls retrieval directly, this UI should be removed or turned into a developer-only diagnostic.
