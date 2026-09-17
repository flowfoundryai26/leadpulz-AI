"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Agent, CallBehavior, TransferRule } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/form";
import { Input, Textarea } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { Switch } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { uid } from "@/lib/utils";
import { TIMEZONES } from "@/lib/constants";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function BehaviorTab({ agent, onChange }: { agent: Agent; onChange: (patch: Partial<Agent>) => void }) {
  const b = agent.behavior;
  const set = (patch: Partial<CallBehavior>) => onChange({ behavior: { ...b, ...patch } });
  const setRule = (id: string, patch: Partial<TransferRule>) => set({ transferRules: b.transferRules.map((r) => (r.id === id ? { ...r, ...patch } : r)) });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Opening & fallback</CardTitle>
          <CardDescription>The first thing callers hear, and what the agent says when it doesn&apos;t understand.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <Field label="Opening message">
            <Textarea value={b.openingMessage} onChange={(e) => set({ openingMessage: e.target.value })} className="min-h-[90px]" />
          </Field>
          <Field label="Fallback response">
            <Textarea value={b.fallbackResponse} onChange={(e) => set({ fallbackResponse: e.target.value })} className="min-h-[90px]" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Voicemail</CardTitle>
          <CardDescription>What happens when an outbound call reaches voicemail.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Behaviour">
            <SimpleSelect value={b.voicemailBehavior} onValueChange={(v) => set({ voicemailBehavior: v as CallBehavior["voicemailBehavior"] })} options={[{ value: "leave_message", label: "Leave a message" }, { value: "hang_up", label: "Hang up silently" }, { value: "retry_later", label: "Hang up and retry later" }]} />
          </Field>
          {b.voicemailBehavior === "leave_message" ? (
            <Field label="Voicemail message">
              <Textarea value={b.voicemailMessage ?? ""} onChange={(e) => set({ voicemailMessage: e.target.value })} />
            </Field>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Limits & silence</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Maximum call duration (sec)">
            <Input type="number" value={b.maxCallDurationSec} onChange={(e) => set({ maxCallDurationSec: Number(e.target.value) })} />
          </Field>
          <Field label="Silence timeout (sec)" hint="Agent prompts the caller after this much silence.">
            <Input type="number" value={b.silenceTimeoutSec} onChange={(e) => set({ silenceTimeoutSec: Number(e.target.value) })} />
          </Field>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>Call transfer rules</CardTitle>
            <CardDescription>Conditions under which the agent hands the call to a human.</CardDescription>
          </div>
          <Button variant="secondary" size="sm" onClick={() => set({ transferRules: [...b.transferRules, { id: uid("tr"), label: "New rule", condition: "", destination: "" }] })}>
            <Plus /> Add rule
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {b.transferRules.map((r) => (
            <div key={r.id} className="grid gap-3 rounded-xl border border-border bg-surface-2/40 p-3 sm:grid-cols-[1fr_2fr_1fr_auto]">
              <Input value={r.label} onChange={(e) => setRule(r.id, { label: e.target.value })} placeholder="Label" />
              <Input value={r.condition} onChange={(e) => setRule(r.id, { condition: e.target.value })} placeholder="When the customer…" />
              <Input value={r.destination} onChange={(e) => setRule(r.id, { destination: e.target.value })} placeholder="+91…" className="font-mono" />
              <Button variant="ghost" size="icon" aria-label="Remove rule" onClick={() => set({ transferRules: b.transferRules.filter((x) => x.id !== r.id) })}>
                <Trash2 />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Human handoff & escalation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field label="Human handoff number" hint="Used when the caller asks for a person.">
            <Input value={b.humanHandoffNumber ?? ""} onChange={(e) => set({ humanHandoffNumber: e.target.value })} className="font-mono" />
          </Field>
          <Field label="Emergency escalation number" hint="Used immediately for urgent or safety-critical situations.">
            <Input value={b.emergencyEscalationNumber ?? ""} onChange={(e) => set({ emergencyEscalationNumber: e.target.value })} className="font-mono" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business hours</CardTitle>
          <CardDescription>Outside these hours the agent follows the after-hours behaviour.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Timezone">
              <SimpleSelect value={b.businessHours.timezone} onValueChange={(tz) => set({ businessHours: { ...b.businessHours, timezone: tz } })} options={TIMEZONES.map((t) => ({ value: t, label: t }))} />
            </Field>
            <Field label="After hours">
              <SimpleSelect value={b.businessHours.afterHoursBehavior} onValueChange={(v) => set({ businessHours: { ...b.businessHours, afterHoursBehavior: v as "voicemail" | "ai_handles" | "transfer" } })} options={[{ value: "ai_handles", label: "AI handles the call" }, { value: "voicemail", label: "Take a voicemail" }, { value: "transfer", label: "Transfer to on-call" }]} />
            </Field>
          </div>
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => {
              const day = b.businessHours.days.find((x) => x.day === d)!;
              const update = (patch: Partial<typeof day>) => set({ businessHours: { ...b.businessHours, days: b.businessHours.days.map((x) => (x.day === d ? { ...x, ...patch } : x)) } });
              return (
                <div key={d} className="flex items-center gap-3 text-sm">
                  <Switch checked={day.enabled} onCheckedChange={(v) => update({ enabled: v })} aria-label={`Enable ${dayNames[d]}`} />
                  <span className="w-9 text-foreground-secondary">{dayNames[d]}</span>
                  <Input type="time" value={day.open} onChange={(e) => update({ open: e.target.value })} disabled={!day.enabled} className="h-8 w-28" />
                  <span className="text-muted">–</span>
                  <Input type="time" value={day.close} onChange={(e) => update({ close: e.target.value })} disabled={!day.enabled} className="h-8 w-28" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>Holiday schedule</CardTitle>
            <CardDescription>Dates treated as closed regardless of business hours.</CardDescription>
          </div>
          <Button variant="secondary" size="sm" onClick={() => set({ holidays: [...b.holidays, { id: uid("hol"), date: "", name: "" }] })}>
            <Plus /> Add holiday
          </Button>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {b.holidays.map((h) => (
            <div key={h.id} className="flex items-center gap-2 rounded-xl border border-border bg-surface-2/40 p-2">
              <Input type="date" value={h.date} onChange={(e) => set({ holidays: b.holidays.map((x) => (x.id === h.id ? { ...x, date: e.target.value } : x)) })} className="h-8 w-36" />
              <Input value={h.name} onChange={(e) => set({ holidays: b.holidays.map((x) => (x.id === h.id ? { ...x, name: e.target.value } : x)) })} placeholder="Name" className="h-8" />
              <Button variant="ghost" size="icon-xs" aria-label="Remove holiday" onClick={() => set({ holidays: b.holidays.filter((x) => x.id !== h.id) })}>
                <Trash2 />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
