# Documents Feature

Frontend document ingestion surface.

Current chunk:

- Uploads one document to `POST /api/documents`.
- Lists uploaded document metadata from `GET /api/documents`.
- Shows basic status, size, and extracted character count.
- Shows generated chunk count and embedding provider.
- Accepts TXT, Markdown, JSON, CSV, and PDF to match the API.
