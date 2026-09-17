import { withApi } from "@/lib/api/handler";
import { mockServices } from "@/services/mock";

export const GET = withApi(async () => mockServices.calls.getLive());
