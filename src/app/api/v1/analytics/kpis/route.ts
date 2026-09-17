import { withApi } from "@/lib/api/handler";
import { mockServices } from "@/services/mock";
import type { DateRangeKey } from "@/types";

export const GET = withApi(async (req) => mockServices.analytics.getKpis((req.nextUrl.searchParams.get("range") as DateRangeKey) ?? "30d"));
