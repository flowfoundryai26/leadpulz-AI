import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { VoiceProviderId } from "@/types";
import { ProviderNotConfiguredError, type ProviderWebhookEvent, type VoiceProvider } from "./provider";
import { voiceLibrary } from "@/data/mock/agents";

/* ───────── Shared helpers ───────── */

export function verifyHmacSignature(rawBody: string, signature: string | null, secret: string | undefined) {
  if (!signature || !secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature.replace(/^sha256=/, ""));
  return a.length === b.length && timingSafeEqual(a, b);
}

/* ───────── LeadPulz native (demo / self-hosted) ───────── */

class LeadPulzVoiceProvider implements VoiceProvider {
  readonly id = "leadpulz" as const;
  async listVoices() {
    return voiceLibrary.filter((v) => v.provider === "leadpulz").map((v) => ({ id: v.id, name: v.name, gender: v.gender, accent: v.accent, languages: ["en", "hi", "te"] }));
  }
  async previewVoice() {
    return { audioUrl: "", durationSec: 4 };
  }
  async startOutboundCall() {
    return { providerCallId: `lp_${Date.now()}`, status: "queued" as const };
  }
  async endCall() {}
  async transferCall() {}
  async parseWebhook(rawBody: string, headers: Headers): Promise<ProviderWebhookEvent[]> {
    if (!verifyHmacSignature(rawBody, headers.get("x-leadpulz-signature"), process.env.LEADPULZ_VOICE_WEBHOOK_SECRET)) throw new Error("Invalid signature");
    const body = JSON.parse(rawBody);
    return [{ type: body.type, providerCallId: body.call_id, payload: body, occurredAt: new Date().toISOString() }];
  }
  async buyNumber(country: string) {
    return { number: country === "India" ? "+91 40 6969 1299" : "+1 (415) 555-0199", providerNumberId: `lpn_${Date.now()}` };
  }
}

/* ───────── Retell AI ───────── */

class RetellProvider implements VoiceProvider {
  readonly id = "retell" as const;
  private key = process.env.RETELL_API_KEY;
  private ensure() {
    if (!this.key) throw new ProviderNotConfiguredError("retell");
  }
  async listVoices() {
    this.ensure();
    // TODO: GET https://api.retellai.com/list-voices
    return [];
  }
  async previewVoice() {
    this.ensure();
    return { audioUrl: "", durationSec: 0 };
  }
  async startOutboundCall() {
    this.ensure();
    // TODO: POST https://api.retellai.com/v2/create-phone-call
    return { providerCallId: "", status: "queued" as const };
  }
  async endCall() {
    this.ensure();
  }
  async transferCall() {
    this.ensure();
  }
  async parseWebhook(rawBody: string, headers: Headers) {
    if (!verifyHmacSignature(rawBody, headers.get("x-retell-signature"), this.key)) throw new Error("Invalid signature");
    return [];
  }
}

/* ───────── Vapi ───────── */

class VapiProvider implements VoiceProvider {
  readonly id = "vapi" as const;
  private key = process.env.VAPI_API_KEY;
  private ensure() {
    if (!this.key) throw new ProviderNotConfiguredError("vapi");
  }
  async listVoices() { this.ensure(); return []; }
  async previewVoice() { this.ensure(); return { audioUrl: "", durationSec: 0 }; }
  async startOutboundCall() { this.ensure(); return { providerCallId: "", status: "queued" as const }; }
  async endCall() { this.ensure(); }
  async transferCall() { this.ensure(); }
  async parseWebhook(rawBody: string, headers: Headers) {
    if (!verifyHmacSignature(rawBody, headers.get("x-vapi-signature"), process.env.VAPI_WEBHOOK_SECRET)) throw new Error("Invalid signature");
    return [];
  }
}

/* ───────── Twilio (telephony + BYO) ───────── */

class TwilioProvider implements VoiceProvider {
  readonly id = "twilio" as const;
  private sid = process.env.TWILIO_ACCOUNT_SID;
  private ensure() {
    if (!this.sid || !process.env.TWILIO_AUTH_TOKEN) throw new ProviderNotConfiguredError("twilio");
  }
  async listVoices() { return []; }
  async previewVoice() { return { audioUrl: "", durationSec: 0 }; }
  async startOutboundCall() { this.ensure(); return { providerCallId: "", status: "queued" as const }; }
  async endCall() { this.ensure(); }
  async transferCall() { this.ensure(); }
  async parseWebhook() { return []; }
  async buyNumber() { this.ensure(); return { number: "", providerNumberId: "" }; }
}

/* ───────── ElevenLabs (TTS voices) ───────── */

class ElevenLabsProvider implements VoiceProvider {
  readonly id = "elevenlabs" as const;
  private key = process.env.ELEVENLABS_API_KEY;
  private ensure() {
    if (!this.key) throw new ProviderNotConfiguredError("elevenlabs");
  }
  async listVoices() {
    return voiceLibrary.filter((v) => v.provider === "elevenlabs").map((v) => ({ id: v.id, name: v.name, gender: v.gender, accent: v.accent, languages: ["en"] }));
  }
  async previewVoice() { this.ensure(); return { audioUrl: "", durationSec: 0 }; }
  async startOutboundCall(): Promise<never> { throw new Error("ElevenLabs is a TTS provider; pair it with a telephony provider."); }
  async endCall() {}
  async transferCall() {}
  async parseWebhook() { return []; }
}

const registry: Record<VoiceProviderId, () => VoiceProvider> = {
  leadpulz: () => new LeadPulzVoiceProvider(),
  retell: () => new RetellProvider(),
  vapi: () => new VapiProvider(),
  twilio: () => new TwilioProvider(),
  elevenlabs: () => new ElevenLabsProvider(),
};

export function getVoiceProvider(id: VoiceProviderId = (process.env.DEFAULT_VOICE_PROVIDER as VoiceProviderId) ?? "leadpulz"): VoiceProvider {
  return registry[id]();
}

export type { VoiceProvider } from "./provider";
