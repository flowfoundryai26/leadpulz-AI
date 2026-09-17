"use client";

import { useState } from "react";
import { Volume2, Mic, Check } from "lucide-react";
import { toast } from "sonner";
import type { Agent, LanguageCode, VoiceConfig } from "@/types";
import { services } from "@/services";
import { voiceLibrary } from "@/data/mock/agents";
import { ACCENTS, LANGUAGES, TONES } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/form";
import { SimpleSelect } from "@/components/ui/select";
import { Slider } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Waveform } from "@/components/dashboard/live-activity";

export function VoiceTab({ agent, onChange }: { agent: Agent; onChange: (patch: Partial<Agent>) => void }) {
  const v = agent.voice;
  const set = (patch: Partial<VoiceConfig>) => onChange({ voice: { ...v, ...patch } });
  const [playing, setPlaying] = useState(false);

  const listen = async () => {
    setPlaying(true);
    await services.agents.previewVoice(v.voiceId, agent.behavior.openingMessage);
    setPlaying(false);
    toast.success(`Played ${v.voiceName} preview`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Voice & provider</CardTitle>
            <CardDescription>Voice providers are abstracted — switch between LeadPulz, ElevenLabs, Retell or Vapi voices without changing anything else.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Provider">
              <SimpleSelect value={v.provider} onValueChange={(p) => set({ provider: p as VoiceConfig["provider"] })} options={[{ value: "leadpulz", label: "LeadPulz Voice (recommended)" }, { value: "elevenlabs", label: "ElevenLabs" }, { value: "retell", label: "Retell AI" }, { value: "vapi", label: "Vapi" }]} />
            </Field>
            <Field label="Voice">
              <div className="grid gap-2 sm:grid-cols-2">
                {voiceLibrary
                  .filter((x) => v.provider === "leadpulz" ? x.provider === "leadpulz" : x.provider !== "leadpulz" || v.provider === "retell" || v.provider === "vapi")
                  .map((x) => (
                    <button key={x.id} type="button" onClick={() => set({ voiceId: x.id, voiceName: x.name, gender: x.gender, accent: x.accent })} className={cn("flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left", v.voiceId === x.id ? "border-primary/60 bg-primary-soft" : "border-border hover:border-border-strong")}>
                      <span className="flex size-8 items-center justify-center rounded-full bg-surface-2"><Mic className="size-4 text-muted" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{x.name} <span className="text-xs font-normal capitalize text-muted">· {x.gender} · {x.accent}</span></span>
                        <span className="block text-[11px] text-muted">{x.sample}</span>
                      </span>
                      {v.voiceId === x.id ? <Check className="size-4 text-primary" /> : null}
                    </button>
                  ))}
              </div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Accent">
                <SimpleSelect value={v.accent} onValueChange={(a) => set({ accent: a })} options={ACCENTS.map((a) => ({ value: a, label: a }))} />
              </Field>
              <Field label="Tone">
                <SimpleSelect value={v.tone} onValueChange={(t) => set({ tone: t as VoiceConfig["tone"] })} options={TONES.map((t) => ({ value: t.value, label: t.label }))} />
              </Field>
              <Field label="Emotion">
                <SimpleSelect value={v.emotion} onValueChange={(e) => set({ emotion: e as VoiceConfig["emotion"] })} options={[{ value: "neutral", label: "Neutral" }, { value: "warm", label: "Warm" }, { value: "cheerful", label: "Cheerful" }, { value: "empathetic", label: "Empathetic" }]} />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
            <CardDescription>Primary language plus any additional languages the agent can switch to mid-call.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Primary language">
              <SimpleSelect value={v.language} onValueChange={(l) => set({ language: l as LanguageCode, additionalLanguages: v.additionalLanguages.filter((x) => x !== l) })} options={LANGUAGES.map((l) => ({ value: l.code, label: `${l.label} (${l.native})` }))} />
            </Field>
            <Field label="Additional languages">
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.filter((l) => l.code !== v.language).map((l) => {
                  const on = v.additionalLanguages.includes(l.code);
                  return (
                    <button key={l.code} type="button" onClick={() => set({ additionalLanguages: on ? v.additionalLanguages.filter((x) => x !== l.code) : [...v.additionalLanguages, l.code] })} className={cn("rounded-full border px-3 py-1 text-xs", on ? "border-primary/60 bg-primary-soft text-[#c7c7ff]" : "border-border text-foreground-secondary hover:border-border-strong")}>
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversation dynamics</CardTitle>
            <CardDescription>Fine-tune how natural and responsive the agent feels on a call.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <SliderField label="Speaking speed" value={v.speed} min={0.7} max={1.4} step={0.05} display={`${v.speed.toFixed(2)}×`} onChange={(n) => set({ speed: n })} />
            <SliderField label="Responsiveness" value={v.responsiveness} min={0} max={1} step={0.05} display={`${Math.round(v.responsiveness * 100)}%`} onChange={(n) => set({ responsiveness: n })} hint="Higher = replies faster, may interrupt more." />
            <SliderField label="Interruption sensitivity" value={v.interruptionSensitivity} min={0} max={1} step={0.05} display={`${Math.round(v.interruptionSensitivity * 100)}%`} onChange={(n) => set({ interruptionSensitivity: n })} hint="How easily the caller can talk over the agent." />
            <SliderField label="Pause duration" value={v.pauseDurationMs} min={200} max={1500} step={50} display={`${v.pauseDurationMs} ms`} onChange={(n) => set({ pauseDurationMs: n })} />
            <SliderField label="Response delay" value={v.responseDelayMs} min={0} max={1000} step={50} display={`${v.responseDelayMs} ms`} onChange={(n) => set({ responseDelayMs: n })} />
            <Field label="Background noise handling">
              <SimpleSelect value={v.backgroundNoiseHandling} onValueChange={(b) => set({ backgroundNoiseHandling: b as VoiceConfig["backgroundNoiseHandling"] })} options={[{ value: "off", label: "Off" }, { value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High (noisy environments)" }]} />
            </Field>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>{v.voiceName} · {v.accent} · {TONES.find((t) => t.value === v.tone)?.label}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground-secondary">&ldquo;{agent.behavior.openingMessage}&rdquo;</p>
          <div className="mt-4 flex h-12 items-center justify-center rounded-lg bg-background-subtle">{playing ? <Waveform /> : <span className="text-xs text-faint">Ready to play</span>}</div>
          <Button className="mt-4 w-full" variant="secondary" onClick={listen} loading={playing}>
            {!playing ? <Volume2 /> : null} Listen to Voice
          </Button>
          <div className="mt-4 flex flex-wrap gap-1.5">
            <Badge variant="muted" className="capitalize">{v.provider}</Badge>
            <Badge variant="muted">{LANGUAGES.find((l) => l.code === v.language)?.label}</Badge>
            {v.additionalLanguages.map((l) => <Badge key={l} variant="outline">{LANGUAGES.find((x) => x.code === l)?.label}</Badge>)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SliderField({ label, value, min, max, step, display, onChange, hint }: { label: string; value: number; min: number; max: number; step: number; display: string; onChange: (n: number) => void; hint?: string }) {
  return (
    <Field label={<span className="flex w-full justify-between">{label}<span className="font-mono text-xs text-muted">{display}</span></span>} hint={hint}>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={([n]) => onChange(n)} className="mt-1" />
    </Field>
  );
}
