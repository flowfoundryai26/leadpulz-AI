"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Database, FileSpreadsheet, Rocket, Upload, UserPlus } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import type { CampaignType } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/form";
import { Input, Textarea } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CAMPAIGN_TYPES, TIMEZONES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";

const steps = ["Type", "Details", "Contacts", "Schedule", "Review"];

function NewCampaign() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: agents } = useQuery(() => services.agents.list(), []);
  const [step, setStep] = useState(params.get("step") === "contacts" ? 2 : 0);
  const [type, setType] = useState<CampaignType>("lead_follow_up");
  const [form, setForm] = useState({
    name: "October Lead Follow-up",
    agentId: "agt_ravi",
    objective: "Call every lead who enquired in the last 30 days but did not book, answer questions and offer two consultation slots.",
    script: "Reference their original enquiry. Ask if they still have the concern. Offer the earliest two slots. If not interested, ask permission for a follow-up in 30 days.",
    callingStart: "10:00",
    callingEnd: "18:00",
    timezone: "Asia/Kolkata",
    maxAttempts: "2",
    retryDelay: "240",
    startDate: formatDate(new Date(), "yyyy-MM-dd"),
    endDate: "",
  });
  const [importMode, setImportMode] = useState<"csv" | "excel" | "crm" | "manual">("csv");
  const [imported, setImported] = useState<{ imported: number; skipped: number; name: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const [manual, setManual] = useState({ name: "", phone: "", email: "", company: "", tags: "" });
  const [launching, setLaunching] = useState(false);

  const doImport = async (file: File | null, label: string, rows?: number) => {
    setImporting(true);
    const r = await services.campaigns.importContacts("new", file, rows);
    setImported({ ...r, name: label });
    setImporting(false);
    toast.success(`${r.imported} contacts imported`, { description: `${r.skipped} skipped (duplicates or invalid numbers).` });
  };

  const launch = async (asDraft: boolean) => {
    setLaunching(true);
    const c = await services.campaigns.create({
      name: form.name,
      type,
      agentId: form.agentId,
      objective: form.objective,
      script: form.script,
      contactListName: imported?.name ?? "No contacts",
      totalContacts: imported?.imported ?? 0,
      callingHours: { start: form.callingStart, end: form.callingEnd },
      timezone: form.timezone,
      maxAttempts: Number(form.maxAttempts),
      retryDelayMin: Number(form.retryDelay),
      startDate: new Date(form.startDate).toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
    });
    if (!asDraft) await services.campaigns.setStatus(c.id, "running");
    setLaunching(false);
    toast.success(asDraft ? "Campaign saved as draft" : "Campaign launched", { description: asDraft ? undefined : `${c.agentName.split(" — ")[0]} will start calling at ${form.callingStart}.` });
    router.push(`/campaigns/${c.id}`);
  };

  const agent = agents?.find((a) => a.id === form.agentId);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader breadcrumbs={[{ label: "Campaigns", href: "/campaigns" }, { label: "New campaign" }]} title="Create campaign" description="Set up an outbound calling campaign in five steps." />
      <ol className="mb-6 flex flex-wrap items-center gap-2 text-xs">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span className={cn("flex size-6 items-center justify-center rounded-full border text-[11px] font-semibold", i < step ? "border-success bg-success text-white" : i === step ? "border-primary bg-primary text-white" : "border-border text-muted")}>{i < step ? <Check className="size-3" /> : i + 1}</span>
            <span className={i === step ? "font-medium text-foreground" : "text-muted"}>{s}</span>
            {i < steps.length - 1 ? <span className="mx-1 h-px w-6 bg-border" /> : null}
          </li>
        ))}
      </ol>

      <Card>
        <CardContent className="p-6">
          {step === 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {CAMPAIGN_TYPES.map((t) => (
                <button key={t.value} type="button" onClick={() => setType(t.value)} className={cn("rounded-xl border p-4 text-left", type === t.value ? "border-primary/60 bg-primary-soft" : "border-border hover:border-border-strong")}>
                  <p className="text-sm font-semibold">{t.label}</p><p className="mt-0.5 text-xs text-muted">{t.description}</p>
                </button>
              ))}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Campaign name" required className="sm:col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="AI agent" required className="sm:col-span-2"><SimpleSelect value={form.agentId} onValueChange={(v) => setForm({ ...form, agentId: v })} options={(agents ?? []).map((a) => ({ value: a.id, label: a.name }))} /></Field>
              <Field label="Campaign objective" className="sm:col-span-2"><Textarea value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} /></Field>
              <Field label="Call script / guidance" className="sm:col-span-2" hint="Added to the agent's context for this campaign only."><Textarea value={form.script} onChange={(e) => setForm({ ...form, script: e.target.value })} className="min-h-[110px]" /></Field>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5">
              <div className="grid gap-2 sm:grid-cols-4">
                {[{ k: "csv", l: "CSV upload", i: <Upload /> }, { k: "excel", l: "Excel upload", i: <FileSpreadsheet /> }, { k: "crm", l: "CRM import", i: <Database /> }, { k: "manual", l: "Manual contact", i: <UserPlus /> }].map((m) => (
                  <button key={m.k} type="button" onClick={() => setImportMode(m.k as typeof importMode)} className={cn("flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm [&_svg]:size-4", importMode === m.k ? "border-primary/60 bg-primary-soft" : "border-border hover:border-border-strong")}>{m.i}{m.l}</button>
                ))}
              </div>
              {importMode === "csv" || importMode === "excel" ? (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong px-6 py-10 text-center hover:border-primary/60 hover:bg-primary-soft/20">
                  <Upload className="size-6 text-muted" />
                  <span className="mt-2 text-sm font-medium">{importing ? "Importing…" : `Drop your ${importMode === "csv" ? ".csv" : ".xlsx"} file here or click to browse`}</span>
                  <span className="mt-1 text-xs text-muted">Required columns: Name, Phone, Email, Company, Tags</span>
                  <input type="file" accept={importMode === "csv" ? ".csv" : ".xlsx,.xls"} className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) doImport(f, f.name); }} />
                </label>
              ) : null}
              {importMode === "crm" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[["HubSpot — List: 'Unbooked leads (Sep)'", 184], ["HubSpot — Lifecycle: Lead", 612], ["Salesforce — Not connected", 0]].map(([l, n]) => (
                    <button key={String(l)} type="button" disabled={!n} onClick={() => doImport(null, String(l), Number(n))} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-left text-sm hover:border-border-strong disabled:opacity-50"><span>{l}</span><Badge variant="muted">{n ? `${n} contacts` : "—"}</Badge></button>
                  ))}
                </div>
              ) : null}
              {importMode === "manual" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Name" required><Input value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })} /></Field>
                  <Field label="Phone" required><Input value={manual.phone} onChange={(e) => setManual({ ...manual, phone: e.target.value })} className="font-mono" /></Field>
                  <Field label="Email"><Input value={manual.email} onChange={(e) => setManual({ ...manual, email: e.target.value })} /></Field>
                  <Field label="Company"><Input value={manual.company} onChange={(e) => setManual({ ...manual, company: e.target.value })} /></Field>
                  <Field label="Tags" className="sm:col-span-2"><Input value={manual.tags} onChange={(e) => setManual({ ...manual, tags: e.target.value })} placeholder="comma, separated" /></Field>
                  <Button variant="secondary" className="sm:col-span-2" disabled={!manual.name || !manual.phone} onClick={() => { setImported((p) => ({ imported: (p?.imported ?? 0) + 1, skipped: p?.skipped ?? 0, name: "Manual contacts" })); setManual({ name: "", phone: "", email: "", company: "", tags: "" }); toast.success("Contact added"); }}><UserPlus /> Add contact</Button>
                </div>
              ) : null}
              {imported ? (
                <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success-soft px-4 py-3 text-sm">
                  <Check className="size-4 text-success" />
                  <span className="flex-1"><span className="font-medium">{imported.imported} contacts</span> ready from <span className="text-foreground-secondary">{imported.name}</span> · {imported.skipped} skipped</span>
                  <Button variant="ghost" size="xs" onClick={() => setImported(null)}>Clear</Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Calling hours start"><Input type="time" value={form.callingStart} onChange={(e) => setForm({ ...form, callingStart: e.target.value })} /></Field>
              <Field label="Calling hours end"><Input type="time" value={form.callingEnd} onChange={(e) => setForm({ ...form, callingEnd: e.target.value })} /></Field>
              <Field label="Timezone"><SimpleSelect value={form.timezone} onValueChange={(v) => setForm({ ...form, timezone: v })} options={TIMEZONES.map((t) => ({ value: t, label: t }))} /></Field>
              <Field label="Max attempts per contact"><SimpleSelect value={form.maxAttempts} onValueChange={(v) => setForm({ ...form, maxAttempts: v })} options={["1", "2", "3", "5"].map((n) => ({ value: n, label: n }))} /></Field>
              <Field label="Retry delay"><SimpleSelect value={form.retryDelay} onValueChange={(v) => setForm({ ...form, retryDelay: v })} options={[["60", "1 hour"], ["240", "4 hours"], ["1440", "1 day"], ["2880", "2 days"]].map(([v, l]) => ({ value: v, label: l }))} /></Field>
              <div />
              <Field label="Start date"><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
              <Field label="End date (optional)"><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                {[["Name", form.name], ["Type", CAMPAIGN_TYPES.find((t) => t.value === type)?.label], ["AI agent", agent?.name], ["Contacts", imported ? `${imported.imported} (${imported.name})` : "None yet"], ["Calling hours", `${form.callingStart} – ${form.callingEnd} ${form.timezone}`], ["Attempts", `${form.maxAttempts} · retry after ${form.retryDelay} min`], ["Starts", form.startDate], ["Ends", form.endDate || "When list completes"]].map(([k, v]) => (
                  <div key={String(k)} className="rounded-lg border border-border p-3"><dt className="text-[11px] uppercase tracking-wider text-muted">{k}</dt><dd className="mt-0.5 font-medium">{v}</dd></div>
                ))}
              </dl>
              <p className="rounded-lg bg-surface-2/60 p-3 text-sm text-foreground-secondary">{form.objective}</p>
              {!imported ? <p className="text-xs text-warning">No contacts imported — the campaign will be saved as a draft.</p> : null}
              {agent?.status !== "active" ? <p className="text-xs text-warning">{agent?.name.split(" — ")[0]} is {agent?.status}. Launching will activate the agent.</p> : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => (step === 0 ? router.push("/campaigns") : setStep(step - 1))}><ArrowLeft /> {step === 0 ? "Cancel" : "Back"}</Button>
        {step < 4 ? (
          <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !form.name}>Continue <ArrowRight /></Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => launch(true)} loading={launching}>Save as draft</Button>
            <Button onClick={() => launch(false)} loading={launching} disabled={!imported}>{!launching ? <Rocket /> : null} Launch campaign</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewCampaignPage() {
  return <Suspense><NewCampaign /></Suspense>;
}
