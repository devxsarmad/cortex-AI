export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const createApiHeaders = (headers: HeadersInit = {}) => {
  const apiKey = process.env.NEXT_PUBLIC_CORTEX_API_KEY;
  const nextHeaders = new Headers(headers);

  if (apiKey) {
    nextHeaders.set("x-cortex-api-key", apiKey);
  }

  return nextHeaders;
};
