"use client";

import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const composerSchema = z.object({
  content: z.string().max(20_000, "Messages cannot exceed 20,000 characters.").refine((value) => value.trim().length > 0, "Enter a message.")
});
type ComposerValues = z.infer<typeof composerSchema>;

type ChatComposerProps = { isStreaming: boolean; selectedDocumentCount: number; onSubmit: (content: string) => void };

export function ChatComposer({ isStreaming, selectedDocumentCount, onSubmit }: ChatComposerProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ComposerValues>({
    resolver: zodResolver(composerSchema), defaultValues: { content: "" }
  });
  const content = watch("content");
  const canSubmit = content.trim().length > 0 && !isStreaming;
  const contextLabel = selectedDocumentCount > 0
    ? `Using ${selectedDocumentCount} selected source${selectedDocumentCount === 1 ? "" : "s"}`
    : "No sources selected";
  const submit = handleSubmit(({ content: value }) => { onSubmit(value.trim()); reset(); });

  return <form ref={formRef} onSubmit={submit} noValidate className="mt-4">
    <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-500"><span>{contextLabel}</span>{isStreaming && <span>Generating answer...</span>}</div>
    <div className="flex gap-3">
      <div className="flex-1">
        <Textarea
          {...register("content")}
          onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); formRef.current?.requestSubmit(); } }}
          placeholder={selectedDocumentCount > 0 ? "Ask a question about the selected sources..." : "Ask a general question, or select sources for document-backed answers..."}
          rows={2}
          aria-invalid={Boolean(errors.content)}
          className="w-full"
        />
        {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>}
      </div>
      <Button type="submit" disabled={!canSubmit} className="h-14 px-5">{isStreaming ? "Streaming" : "Send"}</Button>
    </div>
  </form>;
}
