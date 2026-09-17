import { z } from "zod";
import { withApi, parseBody } from "@/lib/api/handler";
import { mockServices } from "@/services/mock";
import type { LeadStage } from "@/types";

export const GET = withApi(async (req, { organizationId }) => {
  const sp = req.nextUrl.searchParams;
  const r = await mockServices.leads.list({
    stage: (sp.get("stage") as LeadStage) ?? undefined,
    search: sp.get("search") ?? undefined,
    page: Number(sp.get("page") ?? 1),
    pageSize: Number(sp.get("pageSize") ?? 50),
  });
  return { ...r, items: r.items.filter((l) => l.organizationId === organizationId) };
});

const createSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional(),
  company: z.string().optional(),
  estimatedValue: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

export const POST = withApi(async (req) => mockServices.leads.create(await parseBody(req, createSchema)));
