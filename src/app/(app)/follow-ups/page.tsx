"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowDown, Bot, Database, GitBranch, Mail, MessageCircle, Pause, Play, Plus, Repeat, Smartphone, Timer, Trash2, Phone } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import type { FollowUpChannel, FollowUpSequence, FollowUpStep } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/primitives";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Field } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { formatPercent } from "@/lib/format";
import { cn, uid } from "@/lib/utils";

const channelIcon: Record<FollowUpChannel, React.ReactNode> = { phone: <Phone />, sms: <Smartphone />, whatsapp: <MessageCircle />, email: <Mail /> };

function StepChip({ s }: { s: FollowUpStep }) {
  const icon = s.type === "wait" ? <Timer /> : s.type === "ai_call" ? <Bot /> : s.type === "crm_update" ? <Database /> : s.type === "condition" ? <GitBranch /> : channelIcon[s.channel ?? "sms"];
  const tone = s.type === "wait" ? "border-border bg-surface-2 text-muted" : s.type === "ai_call" ? "border-primary/40 bg-primary-soft text-[#c7c7ff]" : s.type === "condition" ? "border-warning/40 bg-warning-soft text-warning" : s.channel === "whatsapp" ? "border-success/40 bg-success-soft text-success" : "border-accent/40 bg-accent-soft text-accent";
  return <span className={cn("inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium [&_svg]:size-3.5", tone)}>{icon}{s.label}</span>;
}

function SequenceCard({ s, onChange }: { s: FollowUpSequence; onChange: () => void }) {
  const toggle = async () => {
    const next = s.status === "active" ? "paused" : "active";
    await services.followUps.setStatus(s.id, next);
    toast.success(next === "active" ? "Sequence activated" : "Sequence paused");
    onChange();
  };
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-[#a3a3ff]"><Repeat className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold">{s.name}</p>
          <p className="text-xs text-muted">Trigger: {s.trigger}</p>
        </div>
        {s.status === "active" ? <Badge variant="success" dot pulse>Active</Badge> : s.status === "paused" ? <Badge variant="warning" dot>Paused</Badge> : <Badge variant="muted">Draft</Badge>}
        <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label={s.status === "active" ? "Pause" : "Activate"}>{s.status === "active" ? <Pause /> : <Play />}</Button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {s.steps.map((st, i) => (
          <span key={st.id} className="flex items-center gap-2">
            <StepChip s={st} />
            {i < s.steps.length - 1 ? <ArrowDown className="size-3.5 -rotate-90 text-faint" /> : null}
          </span>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[["Enrolled", s.enrolled], ["Completed", s.completed], ["Reply rate", formatPercent(s.replyRate)]].map(([l, v]) => <div key={String(l)} className="rounded-lg bg-surface-2/60 py-2"><p className="text-sm font-semibold tabular-nums">{v}</p><p className="text-[10px] text-muted">{l}</p></div>)}
      </div>
    </Card>
  );
}

function NewSequenceDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; onDone: () => void }) {
  const [name, setName] = useState("Unbooked qualified lead recovery");
  const [trigger, setTrigger] = useState("Call completed with outcome = Qualified (no appointment)");
  const [steps, setSteps] = useState<FollowUpStep[]>([
    { id: uid("s"), type: "send", channel: "whatsapp", label: "Send WhatsApp" },
    { id: uid("s"), type: "wait", delayHours: 24, label: "Wait 1 day" },
    { id: uid("s"), type: "send", channel: "email", label: "Send email" },
    { id: uid("s"), type: "wait", delayHours: 48, label: "Wait 2 days" },
    { id: uid("s"), type: "ai_call", label: "AI calls customer" },
    { id: uid("s"), type: "crm_update", label: "Update CRM" },
  ]);
  const [pending, setPending] = useState(false);
  const add = (type: FollowUpStep["type"], channel?: FollowUpChannel) => setSteps((s) => [...s, { id: uid("s"), type, channel, label: type === "wait" ? "Wait 1 day" : type === "ai_call" ? "AI calls customer" : type === "crm_update" ? "Update CRM" : type === "condition" ? "Replied?" : `Send ${channel}`, delayHours: type === "wait" ? 24 : undefined }]);
  const submit = async () => {
    setPending(true);
    await services.followUps.create({ name, trigger, steps });
    setPending(false);
    toast.success("Sequence created as draft");
    onOpenChange(false);
    onDone();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader><DialogTitle>New follow-up sequence</DialogTitle><DialogDescription>Chain messages, waits and AI calls across phone, SMS, WhatsApp and email.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Trigger"><SimpleSelect value={trigger} onValueChange={setTrigger} options={["Call completed with outcome = Qualified (no appointment)", "Lead score between 50 and 74", "Appointment status = No-show", "Appointment status = Completed", "Lead created from website"].map((t) => ({ value: t, label: t }))} /></Field>
          <div>
            <p className="mb-2 text-[13px] font-medium text-foreground-secondary">Steps</p>
            <ol className="space-y-1.5">
              {steps.map((s, i) => (
                <li key={s.id} className="flex items-center gap-2">
                  <span className="w-5 text-right text-xs text-faint">{i + 1}</span>
                  <StepChip s={s} />
                  {s.type === "wait" ? <SimpleSelect size="sm" className="w-28" value={String(s.delayHours ?? 24)} onValueChange={(v) => setSteps((all) => all.map((x) => (x.id === s.id ? { ...x, delayHours: Number(v), label: `Wait ${Number(v) >= 24 ? `${Number(v) / 24} day${Number(v) > 24 ? "s" : ""}` : `${v} hours`}` } : x)))} options={[["2", "2 hours"], ["24", "1 day"], ["48", "2 days"], ["72", "3 days"], ["168", "1 week"]].map(([v, l]) => ({ value: v, label: l }))} /> : null}
                  <Button variant="ghost" size="icon-xs" className="ml-auto" aria-label="Remove step" onClick={() => setSteps((all) => all.filter((x) => x.id !== s.id))}><Trash2 /></Button>
                </li>
              ))}
            </ol>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[["Send WhatsApp", "send", "whatsapp"], ["Send SMS", "send", "sms"], ["Send email", "send", "email"], ["AI call", "ai_call"], ["Wait", "wait"], ["Condition", "condition"], ["Update CRM", "crm_update"]].map(([l, t, c]) => (
                <Button key={l} variant="outline" size="xs" onClick={() => add(t as FollowUpStep["type"], c as FollowUpChannel | undefined)}><Plus /> {l}</Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} loading={pending}>Create sequence</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function FollowUpsPage() {
  const { data, loading, error, refetch } = useQuery(() => services.followUps.list(), []);
  const [open, setOpen] = useState(false);
  return (
    <div>
      <PageHeader title="Follow-ups" description="Automated multi-channel sequences that keep every lead warm until it converts." actions={<Button onClick={() => setOpen(true)}><Plus /> Create Sequence</Button>} />
      <Card className="mb-6">
        <CardHeader><CardTitle>How it works</CardTitle><CardDescription>Example: after a successful call → WhatsApp → wait 1 day → email → wait 2 days → AI calls customer → CRM updated.</CardDescription></CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          {[{ id: "1", type: "send", channel: "whatsapp", label: "Send WhatsApp" }, { id: "2", type: "wait", label: "Wait 1 day" }, { id: "3", type: "send", channel: "email", label: "Send email" }, { id: "4", type: "wait", label: "Wait 2 days" }, { id: "5", type: "ai_call", label: "AI calls customer" }, { id: "6", type: "crm_update", label: "Update CRM" }].map((s, i, arr) => (
            <span key={s.id} className="flex items-center gap-2"><StepChip s={s as FollowUpStep} />{i < arr.length - 1 ? <ArrowDown className="size-3.5 -rotate-90 text-faint" /> : null}</span>
          ))}
        </CardContent>
      </Card>
      {error ? <ErrorState error={error} onRetry={refetch} /> : loading ? <div className="grid gap-4 lg:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}</div> : data?.length ? (
        <div className="grid gap-4 lg:grid-cols-2">{data.map((s) => <SequenceCard key={s.id} s={s} onChange={refetch} />)}</div>
      ) : <EmptyState icon={<Repeat />} title="No follow-up sequences" description="Create a sequence so no qualified lead goes cold." action={<Button onClick={() => setOpen(true)}><Plus /> Create Sequence</Button>} />}
      <NewSequenceDialog open={open} onOpenChange={setOpen} onDone={refetch} />
    </div>
  );
}
