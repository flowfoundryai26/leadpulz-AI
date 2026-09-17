import { z } from "zod";
import { withApi, parseBody } from "@/lib/api/handler";
import { mockServices } from "@/services/mock";

export const GET = withApi(async (_req, { organizationId }) => (await mockServices.agents.list()).filter((a) => a.organizationId === organizationId));

const createSchema = z.object({
  name: z.string().min(2),
  role: z.string().optional(),
  company: z.string().optional(),
  goal: z.string().optional(),
  systemPrompt: z.string().optional(),
});

export const POST = withApi(async (req) => mockServices.agents.create(await parseBody(req, createSchema)));
