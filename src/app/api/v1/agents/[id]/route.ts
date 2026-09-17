import { z } from "zod";
import { withApi, parseBody, ApiError } from "@/lib/api/handler";
import { mockServices } from "@/services/mock";

async function load(id: string, organizationId: string) {
  const a = await mockServices.agents.get(id);
  if (!a || a.organizationId !== organizationId) throw new ApiError(404, "Agent not found", "not_found");
  return a;
}

export const GET = withApi(async (_req, { organizationId, params }) => load(params.id, organizationId));

const patchSchema = z.object({
  name: z.string().optional(),
  status: z.enum(["active", "paused", "draft"]).optional(),
  systemPrompt: z.string().optional(),
  goal: z.string().optional(),
});

export const PATCH = withApi(async (req, { organizationId, params }) => {
  await load(params.id, organizationId);
  return mockServices.agents.update(params.id, await parseBody(req, patchSchema));
});

export const DELETE = withApi(async (_req, { organizationId, params }) => {
  await load(params.id, organizationId);
  await mockServices.agents.remove(params.id);
  return { ok: true };
});
