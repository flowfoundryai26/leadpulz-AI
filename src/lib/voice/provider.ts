/**
 * Voice provider abstraction.
 *
 * LeadPulz never couples to a single telephony/voice vendor. Every provider
 * implements `VoiceProvider`; the platform picks one per agent (or per call)
 * via `getVoiceProvider()`. Credentials are read server-side only.
 */
import type { VoiceProviderId } from "@/types";

export interface VoiceOption {
  id: string;
  name: string;
  gender: "female" | "male" | "neutral";
  accent: string;
  languages: string[];
  previewUrl?: string;
}

export interface StartCallInput {
  agentId: string;
  to: string;
  from: string;
  /** Provider-agnostic agent config (prompt, voice, behaviour). */
  agentConfig: Record<string, unknown>;
  metadata?: Record<string, string>;
}

export interface StartCallResult {
  providerCallId: string;
  status: "queued" | "ringing" | "in_progress";
}

export interface ProviderWebhookEvent {
  type: "call.started" | "call.ended" | "transcript.partial" | "transcript.final" | "recording.ready" | "call.failed";
  providerCallId: string;
  payload: Record<string, unknown>;
  occurredAt: string;
}

export interface VoiceProvider {
  readonly id: VoiceProviderId;
  listVoices(): Promise<VoiceOption[]>;
  previewVoice(voiceId: string, text: string): Promise<{ audioUrl: string; durationSec: number }>;
  startOutboundCall(input: StartCallInput): Promise<StartCallResult>;
  endCall(providerCallId: string): Promise<void>;
  transferCall(providerCallId: string, to: string): Promise<void>;
  /** Verify + normalise a provider webhook into LeadPulz events. */
  parseWebhook(rawBody: string, headers: Headers): Promise<ProviderWebhookEvent[]>;
  /** Provision (buy) a number, if the provider supports telephony. */
  buyNumber?(country: string, areaCode?: string): Promise<{ number: string; providerNumberId: string }>;
}

export class ProviderNotConfiguredError extends Error {
  constructor(id: VoiceProviderId) {
    super(`Voice provider "${id}" is not configured. Set the credentials in the server environment.`);
    this.name = "ProviderNotConfiguredError";
  }
}
