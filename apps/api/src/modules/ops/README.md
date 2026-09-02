# Ops Module

Production operations endpoints and counters.

Current behavior:

- `GET /api/ops/usage` returns in-memory chat request, estimated token, and estimated cost totals.
- Chat usage is estimated from prompt and streamed output character counts.
- Cost stays at `0` unless `AI_INPUT_COST_PER_1K_TOKENS` and `AI_OUTPUT_COST_PER_1K_TOKENS` are configured.

This is intentionally lightweight and can be replaced with persistent metrics storage later.
