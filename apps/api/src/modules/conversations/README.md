# Conversations Module

In-memory chat session storage for Cortex memory.

Current behavior:

- `GET /api/conversations` returns saved chat session summaries.
- `POST /api/conversations` creates a new empty chat session.
- `GET /api/conversations/:id` restores messages and selected document IDs.
- `PUT /api/conversations/:id/messages` saves the latest message list.
- `DELETE /api/conversations/:id` removes a saved chat session.

This repository currently uses process memory for learning speed. A MongoDB repository can replace the in-memory repository later without changing the controller contract.
