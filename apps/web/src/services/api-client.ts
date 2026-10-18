export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => { accessToken = token; };

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
    const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, { method: "POST", credentials: "include" });
    if (refreshResponse.ok) {
      const session = await refreshResponse.json() as { accessToken: string };
      setAccessToken(session.accessToken);
      response = await perform();
    } else {
      setAccessToken(null);
      window.dispatchEvent(new Event("cortex:unauthorized"));
    }
  }
  return response;
};
