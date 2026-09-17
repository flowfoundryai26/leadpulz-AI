"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, Bot, Calendar, Database, GitBranch, Mail, MessageCircle, Plus, Save, Smartphone, Timer, Trash2, Users, Webhook, Zap, ClipboardList, UserPlus, Play, Pause } from "lucide-react";
import type { Workflow, WorkflowActionType, WorkflowTrigger } from "@/types";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field } from "@/components/ui/form";
import { Input, Textarea } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ErrorState, PageSkeleton } from "@/components/ui/states";
import { WORKFLOW_ACTIONS, WORKFLOW_TRIGGERS } from "@/lib/constants";
import { cn, uid } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";

export const actionIcon: Record<WorkflowActionType, React.ReactNode> = {
  send_email: <Mail />, send_sms: <Smartphone />, send_whatsapp: <MessageCircle />, make_ai_call: <Bot />, add_crm_lead: <UserPlus />, update_crm: <Database />, book_appointment: <Calendar />, create_task: <ClipboardList />, webhook: <Webhook />, notify_team: <Users />, wait: <Timer />, condition: <GitBranch />,
};

export function WorkflowEditor({ workflowId }: { workflowId?: string }) {
  const router = useRouter();
  const isNew = !workflowId;
  const existing = useQuery(() => (workflowId ? services.workflows.get(workflowId) : Promise.resolve(null)), [workflowId]);
  const runs = useQuery(() => (workflowId ? services.workflows.getRuns(workflowId) : Promise.resolve([])), [workflowId]);
  const [wf, setWf] = useState<Partial<Workflow>>({ name: "Follow up unbooked qualified leads", description: "", trigger: "lead_qualified", triggerFilter: "appointment_status = none", steps: [{ id: uid("w"), type: "wait", label: "Wait 2 hours" }, { id: uid("w"), type: "send_whatsapp", label: "Send WhatsApp with booking link" }, { id: uid("w"), type: "wait", label: "Wait 1 day" }, { id: uid("w"), type: "condition", label: "Appointment booked?" }, { id: uid("w"), type: "make_ai_call", label: "Ravi calls to book" }, { id: uid("w"), type: "update_crm", label: "Update HubSpot stage" }] });
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  // Hydrate draft from loaded workflow — intentional.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (existing.data) setWf(existing.data); }, [existing.data]);

  const steps = wf.steps ?? [];
  const setStep = (id: string, patch: Partial<Workflow["steps"][number]>) => setWf({ ...wf, steps: steps.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const addStep = (type: WorkflowActionType) => {
    const label = WORKFLOW_ACTIONS.find((a) => a.value === type)?.label ?? type;
    const s = { id: uid("w"), type, label };
    setWf({ ...wf, steps: [...steps, s] });
    setSelected(s.id);
  };

  const save = async (activate?: boolean) => {
    setSaving(true);
    try {
      let saved: Workflow;
      if (isNew) saved = await services.workflows.create({ ...wf, name: wf.name ?? "Untitled workflow" });
      else saved = await services.workflows.update(workflowId!, wf);
      if (activate) await services.workflows.setStatus(saved.id, "active");
      toast.success(activate ? "Workflow activated" : "Workflow saved");
      if (isNew) router.push(`/workflows/${saved.id}`);
      else existing.refetch();
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  };

  if (existing.error) return <ErrorState error={existing.error} onRetry={existing.refetch} />;
  if (!isNew && existing.loading) return <PageSkeleton />;
  const sel = steps.find((s) => s.id === selected);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Workflows", href: "/workflows" }, { label: isNew ? "New workflow" : wf.name ?? "" }]}
        title={<span className="flex items-center gap-3">{isNew ? "Create workflow" : wf.name}{!isNew && wf.status ? <Badge variant={wf.status === "active" ? "success" : wf.status === "paused" ? "warning" : "muted"} dot pulse={wf.status === "active"} className="capitalize">{wf.status}</Badge> : null}</span>}
        description="When a trigger fires, run each action in order. Conditions branch the flow."
        actions={
          <>
            {!isNew && wf.status ? <Button variant="secondary" onClick={async () => { const next = wf.status === "active" ? "paused" : "active"; await services.workflows.setStatus(workflowId!, next); toast.success(next === "active" ? "Activated" : "Paused"); existing.refetch(); }}>{wf.status === "active" ? <><Pause /> Pause</> : <><Play /> Activate</>}</Button> : null}
            <Button variant={isNew ? "secondary" : "primary"} onClick={() => save(false)} loading={saving}><Save /> Save</Button>
            {isNew ? <Button onClick={() => save(true)} loading={saving}><Zap /> Save & activate</Button> : null}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Workflow name" className="sm:col-span-2"><Input value={wf.name ?? ""} onChange={(e) => setWf({ ...wf, name: e.target.value })} /></Field>
              <Field label="Trigger"><SimpleSelect value={wf.trigger} onValueChange={(v) => setWf({ ...wf, trigger: v as WorkflowTrigger })} options={WORKFLOW_TRIGGERS} /></Field>
              <Field label="Filter (optional)" hint="Only run when this condition is true."><Input value={wf.triggerFilter ?? ""} onChange={(e) => setWf({ ...wf, triggerFilter: e.target.value })} placeholder="score >= 50" className="font-mono text-xs" /></Field>
              <Field label="Description" className="sm:col-span-2"><Textarea value={wf.description ?? ""} onChange={(e) => setWf({ ...wf, description: e.target.value })} className="min-h-[60px]" /></Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Steps</CardTitle><CardDescription>Click a step to configure it. Steps run top to bottom.</CardDescription></CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="flex w-full max-w-md items-center gap-3 rounded-xl border border-accent/40 bg-accent-soft px-4 py-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-accent/20 text-accent"><Zap className="size-4" /></span>
                  <div><p className="text-[11px] uppercase tracking-wider text-accent">Trigger</p><p className="text-sm font-medium">{WORKFLOW_TRIGGERS.find((t) => t.value === wf.trigger)?.label}{wf.triggerFilter ? <span className="ml-2 font-mono text-xs text-muted">{wf.triggerFilter}</span> : null}</p></div>
                </div>
                {steps.map((s, i) => (
                  <div key={s.id} className="flex w-full max-w-md flex-col items-center">
                    <ArrowDown className="my-1.5 size-4 text-faint" />
                    <button type="button" onClick={() => setSelected(s.id)} className={cn("flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors", selected === s.id ? "border-primary/60 bg-primary-soft" : "border-border bg-surface hover:border-border-strong", s.type === "condition" && "border-dashed")}>
                      <span className={cn("flex size-8 items-center justify-center rounded-lg [&_svg]:size-4", s.type === "condition" ? "bg-warning-soft text-warning" : s.type === "wait" ? "bg-surface-2 text-muted" : "bg-primary-soft text-[#a3a3ff]")}>{actionIcon[s.type]}</span>
                      <div className="min-w-0 flex-1"><p className="text-[11px] uppercase tracking-wider text-muted">Step {i + 1} · {WORKFLOW_ACTIONS.find((a) => a.value === s.type)?.label}</p><p className="truncate text-sm font-medium">{s.label}</p></div>
                      <Button variant="ghost" size="icon-xs" aria-label="Remove" onClick={(e) => { e.stopPropagation(); setWf({ ...wf, steps: steps.filter((x) => x.id !== s.id) }); }}><Trash2 /></Button>
                    </button>
                  </div>
                ))}
                <ArrowDown className="my-1.5 size-4 text-faint" />
                <div className="flex w-full max-w-md flex-wrap justify-center gap-1.5 rounded-xl border border-dashed border-border p-3">
                  {WORKFLOW_ACTIONS.map((a) => <Button key={a.value} variant="outline" size="xs" onClick={() => addStep(a.value)}><Plus /> {a.label}</Button>)}
                </div>
              </div>
            </CardContent>
          </Card>

          {!isNew ? (
            <Card>
              <CardHeader><CardTitle>Recent runs</CardTitle></CardHeader>
              <CardContent>
                <ul className="divide-y divide-border text-sm">
                  {runs.data?.map((r) => (
                    <li key={r.id} className="flex items-center gap-3 py-2.5">
                      <Badge variant={r.status === "success" ? "success" : r.status === "failed" ? "danger" : "accent"} dot pulse={r.status === "running"} className="capitalize">{r.status}</Badge>
                      <span className="flex-1 truncate">{r.triggerRef}{r.error ? <span className="block text-xs text-danger">{r.error}</span> : null}</span>
                      <span className="text-xs text-muted" suppressHydrationWarning>{formatDateTime(r.startedAt)} · {r.durationMs} ms</span>
                    </li>
                  ))}
                  {runs.data?.length === 0 ? <li className="py-4 text-muted">No runs yet.</li> : null}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader><CardTitle>{sel ? "Configure step" : "Step settings"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {sel ? (
              <>
                <Field label="Label"><Input value={sel.label} onChange={(e) => setStep(sel.id, { label: e.target.value })} /></Field>
                {sel.type === "wait" ? <Field label="Duration"><SimpleSelect value="24" options={[["1", "1 hour"], ["2", "2 hours"], ["24", "1 day"], ["48", "2 days"], ["168", "1 week"]].map(([v, l]) => ({ value: v, label: l }))} /></Field> : null}
                {sel.type === "condition" ? <Field label="Condition" hint="Yes → continue; No → stop."><Input placeholder="appointment_status == booked" className="font-mono text-xs" /></Field> : null}
                {sel.type === "make_ai_call" ? <Field label="Agent"><SimpleSelect value="agt_ravi" options={[{ value: "agt_ravi", label: "Ravi — Lead Follow-up Agent" }, { value: "agt_maya", label: "Maya — Dental Receptionist" }]} /></Field> : null}
                {sel.type === "send_whatsapp" || sel.type === "send_sms" || sel.type === "send_email" ? <Field label="Template"><SimpleSelect value="booking_link" options={[{ value: "booking_link", label: "Booking link" }, { value: "offer", label: "Limited-time offer" }, { value: "reminder", label: "Appointment reminder" }]} /></Field> : null}
                {sel.type === "webhook" ? <Field label="URL"><Input placeholder="https://" /></Field> : null}
                {sel.type === "notify_team" ? <Field label="Channel"><SimpleSelect value="slack" options={[{ value: "slack", label: "Slack #sales" }, { value: "email", label: "Email managers" }, { value: "push", label: "Push notification" }]} /></Field> : null}
                {sel.type === "update_crm" || sel.type === "add_crm_lead" ? <Field label="CRM"><SimpleSelect value="hubspot" options={[{ value: "hubspot", label: "HubSpot" }, { value: "zoho", label: "Zoho CRM" }]} /></Field> : null}
              </>
            ) : <p className="text-sm text-muted">Select a step to edit its settings, or add a new action below the flow.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
