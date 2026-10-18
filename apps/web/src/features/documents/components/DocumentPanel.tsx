"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { DocumentSummary } from "../types/document.types";
import { useDocuments } from "../hooks/useDocuments";

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const statusLabel: Record<DocumentSummary["status"], string> = {
  uploaded: "Uploaded",
  processing: "Processing",
  ready: "Ready",
  needs_parser: "Parser needed",
  failed: "Failed"
};

const pipelineLabel = (document: DocumentSummary) => {
  if (document.status === "uploaded") return "Queued for processing";
  if (document.status === "processing") return "Chunking and embedding";
  if (document.status === "needs_parser") return "Waiting for an unsupported parser such as OCR";
  if (document.status === "failed") return document.errorMessage ?? "Processing failed";
  if (document.chunkCount === 0) return "No chunks";

  const provider = document.embeddingProvider === "openai" ? "OpenAI" : "Mock";
  const vectorStore = document.vectorStoreProvider === "qdrant" ? "Qdrant" : "Memory";
  return `${document.chunkCount} chunks | ${provider} embeddings | ${vectorStore} vectors`;
};

const areSameDocumentIds = (left: string[], right: string[]) => {
  return left.length === right.length && left.every((item, index) => item === right[index]);
};

type DocumentPanelProps = {
  selectedDocumentIds: string[];
  onSelectedDocumentIdsChange: (documentIds: string[]) => void;
};

export function DocumentPanel({ selectedDocumentIds, onSelectedDocumentIdsChange }: DocumentPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const { documentsQuery, uploadMutation, retryMutation, deleteMutation } = useDocuments();
  const documents = useMemo(() => documentsQuery.data ?? [], [documentsQuery.data]);
  const error = uploadMutation.error ?? retryMutation.error ?? deleteMutation.error ?? documentsQuery.error;

  const readyCount = useMemo(
    () => documents.filter((document) => document.status === "ready").length,
    [documents]
  );
  const selectedReadyCount = useMemo(
    () =>
      documents.filter((document) => document.status === "ready" && selectedDocumentIds.includes(document.id)).length,
    [documents, selectedDocumentIds]
  );

  useEffect(() => {
    if (!documentsQuery.data) return;
    const readyIds = new Set(documents.filter((document) => document.status === "ready").map((document) => document.id));
    const nextIds = selectedDocumentIds.filter((documentId) => readyIds.has(documentId));
    if (!areSameDocumentIds(selectedDocumentIds, nextIds)) onSelectedDocumentIdsChange(nextIds);
  }, [documents, documentsQuery.data, onSelectedDocumentIdsChange, selectedDocumentIds]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setStagedFile(file ?? null);
  };

  const handleClearStagedFile = () => {
    setStagedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!stagedFile) return;

    try {
      uploadMutation.reset();
      const document = await uploadMutation.mutateAsync(stagedFile);
      if (document.status === "ready") {
        onSelectedDocumentIdsChange([...selectedDocumentIds, document.id]);
      }
      handleClearStagedFile();
    } catch { /* Mutation state renders the API error. */ }
  };

  const handleRetry = async (documentId: string) => {
    try {
      retryMutation.reset();
      const document = await retryMutation.mutateAsync(documentId);
      if (document.status === "ready" && !selectedDocumentIds.includes(document.id)) {
        onSelectedDocumentIdsChange([...selectedDocumentIds, document.id]);
      }
    } catch { /* Mutation state renders the API error. */ }
  };

  const handleDelete = async (documentId: string) => {
    try {
      deleteMutation.reset();
      const deletedDocumentId = await deleteMutation.mutateAsync(documentId);
      onSelectedDocumentIdsChange(selectedDocumentIds.filter((item) => item !== deletedDocumentId));
    } catch { /* Mutation state renders the API error. */ }
  };

  return (
    <section className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Knowledge sources</h2>
          <p className="mt-1 text-sm text-slate-600">
            {documents.length} uploaded, {readyCount} ready, {selectedReadyCount} selected for chat
          </p>
        </div>

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.md,.markdown,.json,.csv,.pdf,text/plain,text/markdown,application/json,text/csv,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={uploadMutation.isPending}
            onClick={() => inputRef.current?.click()}
          >
            Choose file
          </Button>
          <Button
            type="button"
            disabled={!stagedFile || uploadMutation.isPending}
            onClick={() => void handleUpload()}
          >
            {uploadMutation.isPending ? "Uploading" : "Upload"}
          </Button>
          <Button type="button" variant="ghost" disabled={documentsQuery.isFetching} onClick={() => void documentsQuery.refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      {stagedFile && (
        <div className="mt-3 flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">{stagedFile.name}</p>
            <p className="mt-1 text-xs text-slate-500">{formatBytes(stagedFile.size)} selected, not uploaded yet</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            disabled={uploadMutation.isPending}
            onClick={handleClearStagedFile}
          >
            Clear
          </Button>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error.message}
        </div>
      )}

      <div className="mt-4 grid gap-2">
        {documentsQuery.isPending && <p className="text-sm text-slate-500">Loading documents...</p>}
        {!documentsQuery.isPending && documents.length === 0 && (
          <p className="text-sm text-slate-500">Upload a TXT, Markdown, JSON, CSV, or PDF file.</p>
        )}
        {!documentsQuery.isPending &&
          documents.map((document) => (
            <article
              key={document.id}
              className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <label className="flex min-w-0 flex-1 items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedDocumentIds.includes(document.id)}
                  disabled={document.status !== "ready"}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onSelectedDocumentIdsChange([...selectedDocumentIds, document.id]);
                      return;
                    }

                    onSelectedDocumentIdsChange(selectedDocumentIds.filter((item) => item !== document.id));
                  }}
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />
                <span className="min-w-0">
                  <h3 className="truncate text-sm font-medium text-slate-900">{document.filename}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatBytes(document.sizeBytes)} | {document.characterCount.toLocaleString()} chars
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{pipelineLabel(document)}</p>
                </span>
              </label>
              <div className="flex items-center gap-2">
                <span className="w-fit rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700">
                  {statusLabel[document.status]}
                </span>
                {document.status === "failed" && (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={retryMutation.isPending && retryMutation.variables === document.id}
                    onClick={() => void handleRetry(document.id)}
                  >
                    {retryMutation.isPending && retryMutation.variables === document.id ? "Retrying" : "Retry"}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  disabled={deleteMutation.isPending && deleteMutation.variables === document.id}
                  onClick={() => void handleDelete(document.id)}
                >
                  {deleteMutation.isPending && deleteMutation.variables === document.id ? "Removing" : "Remove"}
                </Button>
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}
