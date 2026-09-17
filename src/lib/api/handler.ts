import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { z, type ZodSchema } from "zod";
import { getSession, type Session } from "@/lib/auth/guards";

/**
 * Route-handler toolkit for /api/v1:
 *  - session or API-key auth (tenant-scoped)
 *  - in-memory token-bucket rate limiting (swap for Redis in production)
 *  - zod validation
 *  - consistent JSON error envelope
 */

export class ApiError extends Error {
  constructor(public status: number, message: string, public code = "error") {
    super(message);
  }
}

const buckets = new Map<string, { tokens: number; updated: number }>();
const LIMIT = 120; // per minute
export function rateLimit(key: string) {
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: LIMIT, updated: now };
  b.tokens = Math.min(LIMIT, b.tokens + ((now - b.updated) / 60_000) * LIMIT);
  b.updated = now;
  if (b.tokens < 1) throw new ApiError(429, "Rate limit exceeded. Try again shortly.", "rate_limited");
  b.tokens -= 1;
  buckets.set(key, b);
}

export interface ApiContext {
  session: Session;
  organizationId: string;
  requestId: string;
}

async function authenticate(req: NextRequest): Promise<Session> {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer lp_")) {
    // TODO(prod): look up hashed key → organization + scopes.
    const s = await getSession();
    if (!s) throw new ApiError(401, "Invalid API key", "unauthorized");
    return s;
  }
  const s = await getSession();
  if (!s) throw new ApiError(401, "Authentication required", "unauthorized");
  return s;
}

export function withApi<T>(handler: (req: NextRequest, ctx: ApiContext & { params: Record<string, string> }) => Promise<T>) {
  return async (req: NextRequest, route?: { params?: Promise<Record<string, string>> }) => {
    const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
    try {
      const session = await authenticate(req);
      rateLimit(`${session.organizationId}:${req.headers.get("authorization") ?? "session"}`);
      const params = (await route?.params) ?? {};
      const data = await handler(req, { session, organizationId: session.organizationId, requestId, params });
      return NextResponse.json(data, { headers: { "x-request-id": requestId } });
    } catch (e) {
      if (e instanceof ApiError) return NextResponse.json({ error: { code: e.code, message: e.message } }, { status: e.status, headers: { "x-request-id": requestId } });
      if (e instanceof z.ZodError) return NextResponse.json({ error: { code: "validation", message: "Invalid request", issues: e.issues } }, { status: 400 });
      console.error(`[api ${requestId}]`, e);
      return NextResponse.json({ error: { code: "internal", message: "Something went wrong" } }, { status: 500, headers: { "x-request-id": requestId } });
    }
  };
}

export async function parseBody<S extends ZodSchema>(req: NextRequest, schema: S): Promise<z.infer<S>> {
  const json = await req.json().catch(() => ({}));
  return schema.parse(json);
}
