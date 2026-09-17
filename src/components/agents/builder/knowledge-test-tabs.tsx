"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Check, Headphones, PhoneCall, Play, Send } from "lucide-react";
import type { Agent, TranscriptTurn } from "@/types";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KnowledgeStatusBadge } from "@/components/ui/domain-badges";
import { Skeleton } from "@/components/ui/primitives";
import { Waveform } from "@/components/dashboard/live-activity";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/format";

export function KnowledgeTab({ agent, onChange }: { agent: Agent; onChange: (patch: Partial<Agent>) => void }) {
  const bases = useQuery(() => services.knowledge.listBases(), []);
  const docs = useQuery(() => services.knowledge.listDocuments(), []);
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Knowledge bases</CardTitle>
          <CardDescription>Select which knowledge bases this agent can answer from.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {bases.loading
            ? [0, 1].map((i) => <Skeleton key={i} className="h-16" />)
            : bases.data?.map((kb) => {
                const on = agent.knowledgeBaseIds.includes(kb.id);
                return (
                  <button key={kb.id} type="button" onClick={() => onChange({ knowledgeBaseIds: on ? agent.knowledgeBaseIds.filter((x) => x !== kb.id) : [...agent.knowledgeBaseIds, kb.id] })} className={cn("flex w-full items-start gap-3 rounded-xl border p-3 text-left", on ? "border-primary/60 bg-primary-soft" : "border-border hover:border-border-strong")}>
                    <span className={cn("mt-0.5 flex size-5 items-center justify-center rounded border", on ? "border-primary bg-primary text-white" : "border-border-strong")}>{on ? <Check className="size-3" /> : null}</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{kb.name}</span>
                      <span className="block text-xs text-muted">{kb.documentCount} documents · {kb.description}</span>
                    </span>
                  </button>
                );
              })}
          <Button asChild variant="secondary" size="sm" className="mt-2 w-full">
            <Link href="/knowledge">
              <BookOpen /> Manage knowledge
            </Link>
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Documents available to {agent.name.split(" — ")[0]}</CardTitle>
          <CardDescription>From the selected knowledge bases.</CardDescription>
        </CardHeader>
        <CardContent>
          {docs.loading ? (
            <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <ul className="divide-y divide-border">
              {docs.data
                ?.filter((d) => agent.knowledgeBaseIds.includes(d.knowledgeBaseId))
                .map((d) => (
                  <li key={d.id} className="flex items-center gap-3 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{d.title}</span>
                      <span className="block text-xs text-muted capitalize">{d.sourceType.replace("_", " ")} · {d.chunks} chunks</span>
                    </span>
                    <KnowledgeStatusBadge status={d.status} />
                  </li>
                ))}
              {docs.data && docs.data.filter((d) => agent.knowledgeBaseIds.includes(d.knowledgeBaseId)).length === 0 ? <li className="py-8 text-center text-sm text-muted">No knowledge bases selected. The agent will rely on its system prompt only.</li> : null}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function TestTab({ agent }: { agent: Agent }) {
  const first = agent.name.split(" — ")[0];
  const [state, setState] = useState<"idle" | "connecting" | "live" | "ended">("idle");
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (state !== "live") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  const start = () => {
    setState("connecting");
    setTranscript([]);
    setElapsed(0);
    setTimeout(() => {
      setState("live");
      setTranscript([{ id: "0", speaker: "ai", offsetSec: 0, text: agent.behavior.openingMessage }]);
    }, 1000);
  };

  const reply = (text: string) => {
    const lower = text.toLowerCase();
    if (/(price|cost|much|fee)/.test(lower)) return "Happy to help with pricing. A single implant starts from ₹35,000 and consultations are free. Would you like me to book a consultation so the doctor can give you an exact quote?";
    if (/(book|appointment|slot|available|schedule)/.test(lower)) return "Of course. Dr. Kavya has openings tomorrow at 11:30 AM and Thursday at 4:00 PM. Which works better for you?";
    if (/(hour|open|timing|close)/.test(lower)) return "We're open Monday to Friday from 9 AM to 7 PM, and Saturdays from 10 AM to 4 PM. Would you like to come in this week?";
    if (/(insurance|emi|payment)/.test(lower)) return "Most health insurance plans don't cover cosmetic work, but we offer 0% EMI over 6 months through Bajaj Finserv. Shall I send you the details on WhatsApp?";
    if (/(human|person|someone|doctor)/.test(lower)) return "Absolutely — let me connect you to the front desk. Please hold for a moment.";
    return `Thanks for sharing that. To make sure I help you correctly, could you tell me a little more about what you're looking for? I can answer questions about our services, pricing, or book an appointment for you.`;
  };

  const send = () => {
    if (!input.trim() || state !== "live") return;
    const text = input.trim();
    setInput("");
    setTranscript((t) => [...t, { id: `${Date.now()}c`, speaker: "customer", offsetSec: elapsed, text }]);
    setTimeout(() => setTranscript((t) => [...t, { id: `${Date.now()}a`, speaker: "ai", offsetSec: elapsed + 2, text: reply(text) }]), 900);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <div className="space-y-3">
        <Card className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Status</span>
            {state === "idle" ? <Badge variant="muted">Ready</Badge> : state === "connecting" ? <Badge variant="accent" dot pulse>Connecting</Badge> : state === "live" ? <Badge variant="success" dot pulse>Live · {formatDuration(elapsed)}</Badge> : <Badge variant="default">Ended</Badge>}
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted">Version</span>
            <span>v{agent.version}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted">Voice</span>
            <span>{agent.voice.voiceName}</span>
          </div>
        </Card>
        <Button className="w-full" onClick={start} disabled={state === "live" || state === "connecting"}>
          <PhoneCall /> Call Agent
        </Button>
        <Button className="w-full" variant="secondary" onClick={start} disabled={state === "live" || state === "connecting"}>
          <Headphones /> Test in Browser
        </Button>
        {state === "live" ? (
          <Button className="w-full" variant="danger-ghost" onClick={() => setState("ended")}>
            End test call
          </Button>
        ) : null}
        <p className="text-[11px] text-faint">Test calls are free and don&apos;t count towards your minutes.</p>
      </div>
      <Card className="flex min-h-[520px] flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Live transcript</p>
          {state === "live" ? <Waveform /> : null}
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {transcript.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted">
              <Play className="mb-2 size-6 text-faint" />
              {state === "connecting" ? "Connecting…" : `Start a test to talk to ${first}.`}
            </div>
          ) : (
            transcript.map((t) => (
              <div key={t.id} className={cn("flex", t.speaker === "ai" ? "justify-start" : "justify-end")}>
                <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed", t.speaker === "ai" ? "rounded-tl-sm bg-surface-2" : "rounded-tr-sm bg-primary text-white")}>
                  <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wider opacity-60">{t.speaker === "ai" ? first : "You"}</span>
                  {t.text}
                </div>
              </div>
            ))
          )}
        </div>
        <form
          className="flex gap-2 border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={state === "live" ? "Type what the customer would say…" : "Start a test call first"} disabled={state !== "live"} />
          <Button type="submit" disabled={state !== "live" || !input.trim()} aria-label="Send">
            <Send />
          </Button>
        </form>
      </Card>
    </div>
  );
}
