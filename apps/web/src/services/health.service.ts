import { API_URL } from "./api-client";

type HealthPayload = {
  ok: boolean;
  providers: {
    llm: string;
  };
};

export const getApiHealth = async (signal?: AbortSignal) => {
  const response = await fetch(`${API_URL}/health`, { signal });

  if (!response.ok) {
    throw new Error("Cortex API is unavailable.");
  }

  return (await response.json()) as HealthPayload;
};
