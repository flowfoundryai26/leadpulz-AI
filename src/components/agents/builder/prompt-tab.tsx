"use client";

import { useState } from "react";
import { Sparkles, Wand2, Braces } from "lucide-react";
import { toast } from "sonner";
import type { Agent } from "@/types";
import { Textarea } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/primitives";
import { Field } from "@/components/ui/form";
import { SimpleSelect } from "@/components/ui/select";

const variables = ["{{customer_name}}", "{{company}}", "{{agent_name}}", "{{business_hours}}", "{{knowledge_base}}", "{{current_time}}", "{{caller_phone}}"];

export function PromptTab({ agent, onChange }: { agent: Agent; onChange: (patch: Partial<Agent>) => void }) {
  const [advanced, setAdvanced] = useState(false);
  const [model, setModel] = useState("leadpulz-conv-2");
  const [temperature, setTemperature] = useState("0.4");
  const words = agent.systemPrompt.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>System prompt</CardTitle>
            <CardDescription>Defines who the agent is, what it must do and how it should behave.</CardDescription>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              toast.success("Prompt improved", { description: "Added clarity on escalation rules and closing summary." });
              onChange({ systemPrompt: agent.systemPrompt + "\n\nAlways end the call by summarising the agreed next step and thanking the caller by name." });
            }}
          >
            <Wand2 /> Improve with AI
          </Button>
        </CardHeader>
        <CardContent>
          <Textarea value={agent.systemPrompt} onChange={(e) => onChange({ systemPrompt: e.target.value })} className="min-h-[420px] font-mono text-[13px] leading-relaxed" spellCheck={false} />
          <div className="mt-2 flex items-center justify-between text-xs text-muted">
            <span>{words} words · ~{Math.round(words * 1.3)} tokens</span>
            <span>Last edited v{agent.version}</span>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Braces className="size-4 text-muted" /> Variables
            </CardTitle>
            <CardDescription>Click to insert at the end of the prompt.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {variables.map((v) => (
              <button key={v} type="button" onClick={() => onChange({ systemPrompt: `${agent.systemPrompt} ${v}` })} className="rounded-md border border-border bg-background-subtle px-2 py-1 font-mono text-[11px] text-accent hover:border-border-strong">
                {v}
              </button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-muted" /> Advanced
            </CardTitle>
            <Switch checked={advanced} onCheckedChange={setAdvanced} aria-label="Toggle advanced settings" />
          </CardHeader>
          {advanced ? (
            <CardContent className="space-y-4">
              <Field label="Model" hint="OpenAI-compatible. Swap providers without changing prompts.">
                <SimpleSelect value={model} onValueChange={setModel} options={[{ value: "leadpulz-conv-2", label: "LeadPulz Conversational v2" }, { value: "gpt-4o", label: "GPT-4o" }, { value: "claude-sonnet", label: "Claude Sonnet" }, { value: "llama-3-70b", label: "Llama 3 70B (self-hosted)" }]} />
              </Field>
              <Field label="Temperature">
                <SimpleSelect value={temperature} onValueChange={setTemperature} options={["0.2", "0.4", "0.6", "0.8"].map((t) => ({ value: t, label: t }))} />
              </Field>
              <Field label="Max response length">
                <SimpleSelect value="short" options={[{ value: "short", label: "Short (best for voice)" }, { value: "medium", label: "Medium" }, { value: "long", label: "Long" }]} />
              </Field>
            </CardContent>
          ) : (
            <CardContent className="text-sm text-muted">Model, temperature and response length. Defaults are tuned for voice.</CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
