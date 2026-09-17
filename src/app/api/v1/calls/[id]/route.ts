import { withApi, ApiError } from "@/lib/api/handler";
import { mockServices } from "@/services/mock";

export const GET = withApi(async (_req, { organizationId, params }) => {
  const call = await mockServices.calls.get(params.id);
  if (!call || call.organizationId !== organizationId) throw new ApiError(404, "Call not found", "not_found");
  return call;
});
