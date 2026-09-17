import { withApi, ApiError } from "@/lib/api/handler";
import { mockServices } from "@/services/mock";

export const GET = withApi(async (_req, { organizationId, params }) => {
  const l = await mockServices.leads.get(params.id);
  if (!l || l.organizationId !== organizationId) throw new ApiError(404, "Lead not found", "not_found");
  return { lead: l, timeline: await mockServices.leads.getTimeline(l.id) };
});
