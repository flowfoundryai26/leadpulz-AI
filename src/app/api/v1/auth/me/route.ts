import { withApi } from "@/lib/api/handler";

export const GET = withApi(async (_req, { session }) => ({
  user: session.user,
  organizationId: session.organizationId,
  workspaceId: session.workspaceId,
  role: session.role,
}));
