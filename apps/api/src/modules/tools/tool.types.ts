export type ToolName = "calculator" | "current_time" | "document_stats";

export type ToolDefinition = {
  name: ToolName;
  description: string;
  parameters: Record<string, unknown>;
};

export type ToolExecution = {
  id: string;
  name: ToolName;
  label: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: "success" | "error";
  errorMessage?: string;
};
