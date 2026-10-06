export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const USER_ID_STORAGE_KEY = "cortex:user-id";

const createUserId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const getCortexUserId = () => {
  if (typeof window === "undefined") {
    return "local-user";
  }

  const existingUserId = window.localStorage.getItem(USER_ID_STORAGE_KEY);
  if (existingUserId) {
    return existingUserId;
  }

  const nextUserId = createUserId();
  window.localStorage.setItem(USER_ID_STORAGE_KEY, nextUserId);
  return nextUserId;
};

export const resetCortexUserId = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_ID_STORAGE_KEY);
};

export const createApiHeaders = (headers: HeadersInit = {}) => {
  const apiKey = process.env.NEXT_PUBLIC_CORTEX_API_KEY;
  const nextHeaders = new Headers(headers);

  if (apiKey) {
    nextHeaders.set("x-cortex-api-key", apiKey);
  }

  nextHeaders.set("x-cortex-user-id", getCortexUserId());

  return nextHeaders;
};
