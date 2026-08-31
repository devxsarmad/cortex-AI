# Agents Module

LangGraph workflow module for routing chat requests through retrieval, backend tools, or both.

Current flow:

- `plan_request` inspects the latest user message, selects `respond`, `retrieve`, `tools`, or `retrieve_and_tools`, and creates a retrieval plan when documents should be searched.
- `retrieve_context` loads relevant document chunks through the RAG service.
- `execute_tools` runs planned backend tools such as calculator, current time, and document stats.
- `build_prompt` builds the final system prompt used by the chat stream.
- Each node appends a trace step so the API can expose basic workflow routing metadata.

Agentic RAG planning:

- Direct questions use a single retrieval query.
- Summary and synthesis questions use the original question plus supporting fact queries.
- Comparison questions use original, similarity, and difference queries.
