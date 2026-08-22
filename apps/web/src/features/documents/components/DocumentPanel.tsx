"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { listDocuments, uploadDocument } from "@/services/document.service";
import type { DocumentSummary } from "../types/document.types";

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const statusLabel: Record<DocumentSummary["status"], string> = {
  ready: "Ready",
  needs_parser: "Parser needed",
  failed: "Failed"
};

const pipelineLabel = (document: DocumentSummary) => {
  if (document.status !== "ready") return "Waiting for parser";
  if (document.chunkCount === 0) return "No chunks";

  const provider = document.embeddingProvider === "openai" ? "OpenAI" : "Mock";
  return `${document.chunkCount} chunks | ${provider} embeddings`;
};

export function DocumentPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void refreshDocuments();
  }, []);

  const readyCount = useMemo(
    () => documents.filter((document) => document.status === "ready").length,
    [documents]
  );

  const refreshDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setDocuments(await listDocuments());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load documents.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      const document = await uploadDocument(file);
      setDocuments((current) => [document, ...current.filter((item) => item.id !== document.id)]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Document upload failed.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <section className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Knowledge sources</h2>
          <p className="mt-1 text-sm text-slate-600">
            {documents.length} uploaded, {readyCount} ready for chunking
          </p>
        </div>

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.md,.markdown,.json,.csv,.pdf,text/plain,text/markdown,application/json,text/csv,application/pdf"
            className="hidden"
            onChange={(event) => void handleUpload(event)}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? "Uploading" : "Upload"}
          </Button>
          <Button type="button" variant="ghost" disabled={isLoading} onClick={() => void refreshDocuments()}>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4 grid gap-2">
        {isLoading && <p className="text-sm text-slate-500">Loading documents...</p>}
        {!isLoading && documents.length === 0 && (
          <p className="text-sm text-slate-500">Upload a TXT, Markdown, JSON, CSV, or PDF file.</p>
        )}
        {!isLoading &&
          documents.map((document) => (
            <article
              key={document.id}
              className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <h3 className="truncate text-sm font-medium text-slate-900">{document.filename}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {formatBytes(document.sizeBytes)} | {document.characterCount.toLocaleString()} chars
                </p>
                <p className="mt-1 text-xs text-slate-500">{pipelineLabel(document)}</p>
              </div>
              <span className="w-fit rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700">
                {statusLabel[document.status]}
              </span>
            </article>
          ))}
      </div>
    </section>
  );
}
