import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { OrgRole, User } from "@/types";
import { currentUser } from "@/data/mock/org";

/**
 * Server-side session helpers.
 *
 * Production: swap `getSession` for Supabase Auth / Clerk session verification.
 * Demo mode (AUTH_ENFORCED != "true") resolves the demo user so every route works
 * without a backend.
 */
export interface Session {
  user: User;
  organizationId: string;
  workspaceId: string;
  role: OrgRole;
}

const AUTH_ENFORCED = process.env.AUTH_ENFORCED === "true";

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get("lp_session")?.value;
  if (AUTH_ENFORCED && !token) return null;
  // TODO(prod): verify JWT / Supabase session and load membership.
  return { user: currentUser, organizationId: "org_apex", workspaceId: "ws_apex_main", role: "owner" };
}

export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

export async function requirePlatformAdmin(): Promise<Session> {
  const s = await requireSession();
  if (!s.user.platformAdmin) redirect("/dashboard");
  return s;
}

const roleRank: Record<OrgRole, number> = { viewer: 0, sales_rep: 1, agent_manager: 2, manager: 3, admin: 4, owner: 5 };

export function hasRole(session: Session, minimum: OrgRole) {
  return roleRank[session.role] >= roleRank[minimum];
}
