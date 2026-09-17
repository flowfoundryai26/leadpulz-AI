/**
 * Thin HTTP client for the LeadPulz REST API.
 * Provider secrets never live here — the browser only ever holds a session
 * cookie; provider keys are read server-side in route handlers.
 */
import { ServiceError } from "../types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
      ...init,
    });
  } catch {
    throw new ServiceError("Network error. Check your connection and try again.", "network");
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.error?.message ?? body.message ?? message;
    } catch {
      /* ignore */
    }
    const code = res.status === 401 ? "unauthorized" : res.status === 404 ? "not_found" : res.status === 402 ? "billing" : "api";
    throw new ServiceError(message, code, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => http<T>(path),
  post: <T>(path: string, body?: unknown) => http<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) => http<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  delete: <T>(path: string) => http<T>(path, { method: "DELETE" }),
};
