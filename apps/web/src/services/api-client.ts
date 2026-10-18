const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
export const API_URL = configuredApiUrl.replace(/\/+$/, "");

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
export const setAccessToken = (token: string | null) => { accessToken = token; };

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/api/auth/refresh`, { method: "POST", credentials: "include" })
      .then(async (response) => {
        if (!response.ok) return null;
        const session = await response.json() as { accessToken: string };
        setAccessToken(session.accessToken);
        return session.accessToken;
      })
      .catch(() => null)
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
};

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly details?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

export const createApiHeaders = (headers: HeadersInit = {}) => {
  const nextHeaders = new Headers(headers);
  const apiKey = process.env.NEXT_PUBLIC_CORTEX_API_KEY;
  if (apiKey) nextHeaders.set("x-cortex-api-key", apiKey);
  if (accessToken) nextHeaders.set("Authorization", `Bearer ${accessToken}`);
  return nextHeaders;
};

export const authFetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
  const perform = () => fetch(input, { ...init, credentials: "include", headers: createApiHeaders(init.headers) });
  let response = await perform();
  if (response.status === 401 && !String(input).includes("/api/auth/")) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      response = await perform();
    } else {
      setAccessToken(null);
      window.dispatchEvent(new Event("cortex:unauthorized"));
    }
  }
  return response;
};

export const apiRequest = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await authFetch(`${API_URL}${path}`, init);
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string; details?: unknown } | null;
    throw new ApiError(payload?.error ?? "The request could not be completed.", response.status, payload?.details);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};
