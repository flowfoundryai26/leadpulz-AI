import { NextResponse, type NextRequest } from "next/server";
import { getVoiceProvider } from "@/lib/voice";
import type { VoiceProviderId } from "@/types";

/**
 * POST /api/v1/webhooks/voice/{provider}
 * Inbound events from voice providers (Retell, Vapi, Twilio, LeadPulz Voice).
 * The provider adapter verifies the signature before anything is processed.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const raw = await req.text();
  try {
    const adapter = getVoiceProvider(provider as VoiceProviderId);
    const events = await adapter.parseWebhook(raw, req.headers);
    // TODO(prod): enqueue events → update calls/transcripts, emit realtime, trigger workflows.
    return NextResponse.json({ received: events.length });
  } catch (e) {
    const message = (e as Error).message;
    const status = message.toLowerCase().includes("signature") ? 401 : 400;
    return NextResponse.json({ error: { code: status === 401 ? "invalid_signature" : "bad_request", message } }, { status });
  }
}
