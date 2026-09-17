"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import type { Agent, QualificationConfig, QualificationQuestion } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox, Slider } from "@/components/ui/primitives";
import { Field } from "@/components/ui/form";
import { uid } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function QualificationTab({ agent, onChange }: { agent: Agent; onChange: (patch: Partial<Agent>) => void }) {
  const q = agent.qualification;
  const set = (patch: Partial<QualificationConfig>) => onChange({ qualification: { ...q, ...patch } });
  const setQ = (id: string, patch: Partial<QualificationQuestion>) => set({ questions: q.questions.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  const totalWeight = q.questions.reduce((a, b) => a + b.weight, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>Qualification questions</CardTitle>
            <CardDescription>The agent works these into the conversation naturally. Each answer contributes to the lead score.</CardDescription>
          </div>
          <Button variant="secondary" size="sm" onClick={() => set({ questions: [...q.questions, { id: uid("q"), question: "", field: "", weight: 10, required: false }] })}>
            <Plus /> Add question
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {q.questions.map((x, i) => (
            <div key={x.id} className="rounded-xl border border-border bg-surface-2/40 p-3">
              <div className="flex items-start gap-2">
                <GripVertical className="mt-2.5 size-4 shrink-0 text-faint" />
                <div className="grid flex-1 gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
                  <Input value={x.question} onChange={(e) => setQ(x.id, { question: e.target.value })} placeholder={`Question ${i + 1}`} />
                  <Input value={x.field} onChange={(e) => setQ(x.id, { field: e.target.value })} placeholder="crm_field" className="font-mono text-xs" />
                </div>
                <Button variant="ghost" size="icon" aria-label="Remove question" onClick={() => set({ questions: q.questions.filter((y) => y.id !== x.id) })}>
                  <Trash2 />
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-6 pl-6">
                <label className="flex items-center gap-2 text-xs text-foreground-secondary">
                  <Checkbox checked={x.required} onCheckedChange={(v) => setQ(x.id, { required: !!v })} /> Required
                </label>
                <div className="flex flex-1 items-center gap-3 text-xs">
                  <span className="text-muted">Weight</span>
                  <Slider min={0} max={40} step={5} value={[x.weight]} onValueChange={([n]) => setQ(x.id, { weight: n })} className="max-w-[200px]" />
                  <span className="w-8 font-mono text-foreground">{x.weight}</span>
                </div>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted">
            Total weight: <span className={totalWeight === 100 ? "text-success" : "text-warning"}>{totalWeight}</span> / 100
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Score thresholds</CardTitle>
            <CardDescription>Score range 0–100. Adjust the boundaries between categories.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label={<span className="flex w-full justify-between"><Badge variant="danger">Hot Lead</Badge><span className="font-mono text-xs">≥ {q.thresholds.hot}</span></span>}>
              <Slider min={50} max={95} step={5} value={[q.thresholds.hot]} onValueChange={([n]) => set({ thresholds: { ...q.thresholds, hot: n } })} />
            </Field>
            <Field label={<span className="flex w-full justify-between"><Badge variant="warning">Warm Lead</Badge><span className="font-mono text-xs">≥ {q.thresholds.warm}</span></span>}>
              <Slider min={25} max={q.thresholds.hot - 5} step={5} value={[q.thresholds.warm]} onValueChange={([n]) => set({ thresholds: { ...q.thresholds, warm: n } })} />
            </Field>
            <Field label={<span className="flex w-full justify-between"><Badge variant="accent">Cold Lead</Badge><span className="font-mono text-xs">≥ {q.thresholds.cold}</span></span>}>
              <Slider min={5} max={q.thresholds.warm - 5} step={5} value={[q.thresholds.cold]} onValueChange={([n]) => set({ thresholds: { ...q.thresholds, cold: n } })} />
            </Field>
            <p className="text-xs text-muted">Below {q.thresholds.cold}: <Badge variant="muted">Not Qualified</Badge></p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Score preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-border">
              <div className="absolute inset-y-0 left-0 bg-accent/70" style={{ width: `${q.thresholds.warm}%` }} />
              <div className="absolute inset-y-0 bg-warning/80" style={{ left: `${q.thresholds.warm}%`, width: `${q.thresholds.hot - q.thresholds.warm}%` }} />
              <div className="absolute inset-y-0 bg-danger/80" style={{ left: `${q.thresholds.hot}%`, width: `${100 - q.thresholds.hot}%` }} />
              <div className="absolute inset-y-0 left-0 bg-faint" style={{ width: `${q.thresholds.cold}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted">
              <span>0</span>
              <span>{q.thresholds.cold}</span>
              <span>{q.thresholds.warm}</span>
              <span>{q.thresholds.hot}</span>
              <span>100</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
