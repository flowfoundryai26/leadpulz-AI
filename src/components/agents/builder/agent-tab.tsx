"use client";

import type { Agent, Channel } from "@/types";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/form";
import { SimpleSelect } from "@/components/ui/select";
import { AGENT_TYPE_LABEL, CHANNEL_LABEL } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const channelAvailability: Record<Channel, "available" | "coming_soon"> = {
  voice: "available",
  whatsapp: "available",
  sms: "available",
  email: "available",
  web_chat: "coming_soon",
  instagram: "coming_soon",
  messenger: "coming_soon",
};

export function AgentTab({ agent, onChange }: { agent: Agent; onChange: (patch: Partial<Agent>) => void }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
          <CardDescription>How the agent presents itself and what it is responsible for.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Agent name" required>
            <Input value={agent.name} onChange={(e) => onChange({ name: e.target.value })} />
          </Field>
          <Field label="Agent role">
            <Input value={agent.role} onChange={(e) => onChange({ role: e.target.value })} placeholder="AI Receptionist" />
          </Field>
          <Field label="Company">
            <Input value={agent.company} onChange={(e) => onChange({ company: e.target.value })} />
          </Field>
          <Field label="Agent type">
            <SimpleSelect value={agent.type} onValueChange={(v) => onChange({ type: v as Agent["type"] })} options={Object.entries(AGENT_TYPE_LABEL).map(([value, label]) => ({ value, label }))} />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea value={agent.description} onChange={(e) => onChange({ description: e.target.value })} className="min-h-[70px]" />
          </Field>
          <Field label="Agent goal" className="sm:col-span-2" hint='Example: "Qualify inbound dental leads and book consultations."'>
            <Textarea value={agent.goal} onChange={(e) => onChange({ goal: e.target.value })} className="min-h-[70px]" />
          </Field>
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Channels</CardTitle>
            <CardDescription>The same agent, same context, across every channel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {(Object.keys(CHANNEL_LABEL) as Channel[]).map((ch) => {
              const on = agent.channels.includes(ch);
              const soon = channelAvailability[ch] === "coming_soon";
              return (
                <button
                  key={ch}
                  type="button"
                  disabled={soon}
                  onClick={() => onChange({ channels: on ? agent.channels.filter((c) => c !== ch) : [...agent.channels, ch] })}
                  className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm", on ? "border-primary/50 bg-primary-soft" : "border-border hover:border-border-strong", soon && "opacity-60")}
                >
                  <span className={cn("flex size-5 items-center justify-center rounded border", on ? "border-primary bg-primary text-white" : "border-border-strong")}>{on ? <Check className="size-3" /> : null}</span>
                  <span className="flex-1">{CHANNEL_LABEL[ch]}</span>
                  {soon ? <Badge variant="muted">Coming soon</Badge> : null}
                </button>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Version</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted">
            <p>
              Currently on <span className="font-medium text-foreground">v{agent.version}</span>. Every save creates a new version you can roll back to.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
