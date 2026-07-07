// http.ts -- shared authed fetch helper.
// Reads the access token from localStorage (key "aps_access_token") and
// attaches it as a Bearer header on every request.
// Used by all real-API paths in the domain clients.

const TOKEN_KEY = "aps_access_token";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extra,
  };
  const token = getStoredToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg: string;
    try {
      const parsed = JSON.parse(text) as { message?: string };
      msg = parsed.message ?? text;
    } catch {
      msg = text || `HTTP ${res.status}`;
    }
    throw new ApiError(res.status, `API error ${res.status}: ${msg}`);
  }
  return res.json() as Promise<T>;
}

export async function authedGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}/${path}`, {
    headers: buildHeaders(),
    credentials: "include",
  });
  return handleResponse<T>(res);
}

export async function authedPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}/${path}`, {
    method: "POST",
    headers: buildHeaders(),
    credentials: "include",
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function authedPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}/${path}`, {
    method: "PATCH",
    headers: buildHeaders(),
    credentials: "include",
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export { BASE_URL };
