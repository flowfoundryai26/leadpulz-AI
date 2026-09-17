import { z } from "zod";
import { withApi, parseBody, ApiError } from "@/lib/api/handler";
import { mockServices } from "@/services/mock";
import { getVoiceProvider } from "@/lib/voice";

/**
 * GET  /api/v1/calls  — list calls (tenant-scoped)
 * POST /api/v1/calls  — start an outbound AI call
 */
export const GET = withApi(async (req, { organizationId }) => {
  const sp = req.nextUrl.searchParams;
  const result = await mockServices.calls.list({
    direction: (sp.get("direction") as "inbound" | "outbound") ?? undefined,
    outcome: sp.get("outcome") ?? undefined,
    agentId: sp.get("agentId") ?? undefined,
    search: sp.get("search") ?? undefined,
    page: Number(sp.get("page") ?? 1),
    pageSize: Number(sp.get("pageSize") ?? 25),
  });
  return { ...result, items: result.items.filter((c) => c.organizationId === organizationId) };
});

const startCallSchema = z.object({
  agent_id: z.string().min(1),
  to: z.string().min(8),
  objective: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const POST = withApi(async (req, { organizationId }) => {
  const body = await parseBody(req, startCallSchema);
  const agent = await mockServices.agents.get(body.agent_id);
  if (!agent || agent.organizationId !== organizationId) throw new ApiError(404, "Agent not found", "not_found");
  const provider = getVoiceProvider(agent.voice.provider);
  const started = await provider.startOutboundCall({
    agentId: agent.id,
    to: body.to,
    from: agent.phoneNumber ?? "",
    agentConfig: { prompt: agent.systemPrompt, voice: agent.voice, behavior: agent.behavior },
    metadata: body.metadata,
  });
  const call = await mockServices.calls.startOutbound({ agentId: agent.id, phone: body.to, objective: body.objective });
  return { call, provider: { id: provider.id, call_id: started.providerCallId, status: started.status } };
});
