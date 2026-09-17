"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Building2, Globe, Laptop, Palette, Plus, Save, ShieldCheck, Smartphone, Upload, Users, Bell, Bot, Phone, Clock, Layers, ArrowRight } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/form";
import { Input, Textarea } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { Avatar, Switch, Skeleton } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/badge";
import { InlineAlert } from "@/components/ui/states";
import { DataTable, type Column } from "@/components/ui/data-table";
import { COUNTRIES, INDUSTRIES, LANGUAGES, TIMEZONES } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import type { AuditLog } from "@/types";

function SaveBar({ onSave }: { onSave?: () => void }) {
  const [saving, setSaving] = useState(false);
  return (
    <div className="flex justify-end">
      <Button onClick={async () => { setSaving(true); await new Promise((r) => setTimeout(r, 500)); setSaving(false); toast.success("Settings saved"); onSave?.(); }} loading={saving}><Save /> Save changes</Button>
    </div>
  );
}

function ToggleRow({ label, hint, defaultOn }: { label: string; hint?: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return <div className="flex items-center justify-between gap-4 py-2.5"><div><p className="text-sm">{label}</p>{hint ? <p className="text-xs text-muted">{hint}</p> : null}</div><Switch checked={on} onCheckedChange={setOn} /></div>;
}

export function ProfileSection() {
  const { data: user } = useQuery(() => services.auth.getCurrentUser(), []);
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle><CardDescription>Your personal details across all organizations.</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4"><Avatar name={user?.fullName ?? "U"} size="xl" /><div><Button variant="secondary" size="sm"><Upload /> Upload photo</Button><p className="mt-1 text-xs text-muted">PNG or JPG, at least 256×256.</p></div></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name"><Input defaultValue={user?.fullName} /></Field>
            <Field label="Email"><Input defaultValue={user?.email} type="email" /></Field>
            <Field label="Phone"><Input defaultValue={user?.phone} /></Field>
            <Field label="Country"><SimpleSelect value={user?.country ?? "India"} options={COUNTRIES.map((c) => ({ value: c, label: c }))} /></Field>
            <Field label="Language"><SimpleSelect value="en" options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))} /></Field>
            <Field label="Timezone"><SimpleSelect value="Asia/Kolkata" options={TIMEZONES.map((t) => ({ value: t, label: t }))} /></Field>
          </div>
          <SaveBar />
        </CardContent>
      </Card>
    </div>
  );
}

export function OrganizationSection() {
  const orgId = useAppStore((s) => s.organizationId);
  const org = useQuery(() => services.tenant.getOrganization(orgId), [orgId]);
  const ws = useQuery(() => services.tenant.getWorkspaces(orgId), [orgId]);
  if (org.loading || !org.data) return <Skeleton className="h-96" />;
  const o = org.data;
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Organization</CardTitle><CardDescription>Tenant-level details. Data is isolated per organization.</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business name"><Input defaultValue={o.name} leftIcon={<Building2 />} /></Field>
            <Field label="Website"><Input defaultValue={o.website} leftIcon={<Globe />} /></Field>
            <Field label="Industry"><SimpleSelect value={o.industry} options={INDUSTRIES} /></Field>
            <Field label="Country"><SimpleSelect value={o.country} options={COUNTRIES.map((c) => ({ value: c, label: c }))} /></Field>
            <Field label="Timezone"><SimpleSelect value={o.timezone} options={TIMEZONES.map((t) => ({ value: t, label: t }))} /></Field>
            <Field label="Organization ID"><Input value={o.id} readOnly className="font-mono text-xs" /></Field>
          </div>
          <SaveBar />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex-row items-start justify-between"><div><CardTitle className="flex items-center gap-2"><Layers className="size-4 text-muted" /> Workspaces</CardTitle><CardDescription>Separate locations or teams inside this organization, each with its own agents, numbers and leads.</CardDescription></div><Button size="sm" variant="secondary" onClick={() => toast.info("Workspace creation is available on Professional and above.")}><Plus /> New workspace</Button></CardHeader>
        <CardContent className="space-y-2">
          {ws.data?.map((w) => <div key={w.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm"><span className="flex-1 font-medium">{w.name}</span><span className="font-mono text-xs text-muted">{w.slug}</span>{w.isDefault ? <Badge variant="primary">Default</Badge> : null}</div>)}
        </CardContent>
      </Card>
    </div>
  );
}

export function AiSection() {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="size-4 text-muted" /> AI settings</CardTitle><CardDescription>Organization-wide defaults. Individual agents can override.</CardDescription></CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default LLM" hint="OpenAI-compatible provider abstraction."><SimpleSelect value="leadpulz-conv-2" options={[{ value: "leadpulz-conv-2", label: "LeadPulz Conversational v2" }, { value: "gpt-4o", label: "GPT-4o" }, { value: "claude-sonnet", label: "Claude Sonnet" }]} /></Field>
          <Field label="Default voice provider"><SimpleSelect value="leadpulz" options={[{ value: "leadpulz", label: "LeadPulz Voice" }, { value: "elevenlabs", label: "ElevenLabs" }, { value: "retell", label: "Retell AI" }, { value: "vapi", label: "Vapi" }]} /></Field>
          <Field label="Default language"><SimpleSelect value="en" options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))} /></Field>
          <Field label="Data retention"><SimpleSelect value="365" options={[["90", "90 days"], ["180", "180 days"], ["365", "1 year"], ["forever", "Indefinite"]].map(([v, l]) => ({ value: v, label: l }))} /></Field>
        </div>
        <div className="divide-y divide-border">
          <ToggleRow label="Generate AI call summaries" defaultOn hint="Summary, intent, next action after every call." />
          <ToggleRow label="Auto-score leads" defaultOn hint="Update lead score from qualification answers." />
          <ToggleRow label="Redact PII in transcripts" hint="Mask card numbers and IDs before storage." />
          <ToggleRow label="Disclose AI identity" defaultOn hint="Agents introduce themselves as virtual assistants." />
        </div>
        <SaveBar />
      </CardContent>
    </Card>
  );
}

export function CallingSection() {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="size-4 text-muted" /> Calling</CardTitle><CardDescription>Compliance and defaults for every call.</CardDescription></CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default caller ID"><SimpleSelect value="pn_1" options={[{ value: "pn_1", label: "+91 40 6969 1200 — Main Reception" }, { value: "pn_2", label: "+91 40 6969 1201 — Skyline Sales Line" }]} /></Field>
          <Field label="Max concurrent calls"><Input type="number" defaultValue={10} /></Field>
          <Field label="Outbound calling window"><Input defaultValue="09:00 – 20:00 (customer local time)" /></Field>
          <Field label="Do-not-call list"><Button variant="secondary" size="sm" className="w-full justify-start"><Upload /> Upload DNC list (CSV)</Button></Field>
        </div>
        <div className="divide-y divide-border">
          <ToggleRow label="Record all calls" defaultOn hint="Announce recording at the start of the call." />
          <ToggleRow label="Honour national DNC registry" defaultOn />
          <ToggleRow label="Answering-machine detection" defaultOn />
        </div>
        <SaveBar />
      </CardContent>
    </Card>
  );
}

export function BusinessHoursSection() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="size-4 text-muted" /> Business hours</CardTitle><CardDescription>Organization default. Agents inherit unless overridden.</CardDescription></CardHeader>
      <CardContent className="space-y-5">
        <Field label="Timezone" className="max-w-xs"><SimpleSelect value="Asia/Kolkata" options={TIMEZONES.map((t) => ({ value: t, label: t }))} /></Field>
        <div className="space-y-2">{days.map((d, i) => <div key={d} className="flex items-center gap-3 text-sm"><Switch defaultChecked={i < 6} /><span className="w-9 text-foreground-secondary">{d}</span><Input type="time" defaultValue={i === 5 ? "10:00" : "09:00"} className="h-8 w-28" /><span className="text-muted">–</span><Input type="time" defaultValue={i === 5 ? "16:00" : "19:00"} className="h-8 w-28" /></div>)}</div>
        <Field label="After hours" className="max-w-xs"><SimpleSelect value="ai" options={[{ value: "ai", label: "AI handles the call" }, { value: "vm", label: "Take a voicemail" }, { value: "transfer", label: "Transfer to on-call" }]} /></Field>
        <SaveBar />
      </CardContent>
    </Card>
  );
}

export function NotificationsSection() {
  const items = ["New qualified lead", "Appointment booked", "High-value lead", "Failed call", "Campaign completed", "Integration error", "Payment issue", "Agent issue"];
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="size-4 text-muted" /> Notifications</CardTitle><CardDescription>Choose where each alert is delivered.</CardDescription></CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_repeat(4,64px)] items-center gap-2 border-b border-border pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted"><span>Event</span><span className="text-center">In-app</span><span className="text-center">Email</span><span className="text-center">Push</span><span className="text-center">Slack</span></div>
        {items.map((it, i) => <div key={it} className="grid grid-cols-[1fr_repeat(4,64px)] items-center gap-2 border-b border-border py-2.5 text-sm"><span>{it}</span><span className="flex justify-center"><Switch defaultChecked /></span><span className="flex justify-center"><Switch defaultChecked={i < 3 || i > 5} /></span><span className="flex justify-center"><Switch defaultChecked={i === 0 || i === 2} /></span><span className="flex justify-center"><Switch defaultChecked={i < 2} /></span></div>)}
        <div className="mt-5"><SaveBar /></div>
      </CardContent>
    </Card>
  );
}

export function SecuritySection() {
  const logs = useQuery(() => services.apiSettings.getAuditLogs(), []);
  const cols: Column<AuditLog>[] = [
    { key: "actor", header: "Actor", cell: (l) => <span className="font-medium">{l.actor}</span> },
    { key: "action", header: "Action", cell: (l) => <span className="font-mono text-xs">{l.action}</span> },
    { key: "target", header: "Target", cell: (l) => <span className="text-foreground-secondary">{l.target}</span> },
    { key: "ip", header: "IP", cell: (l) => <span className="font-mono text-xs text-muted">{l.ip ?? "—"}</span> },
    { key: "at", header: "When", sortValue: (l) => l.at, cell: (l) => <span className="whitespace-nowrap text-xs text-muted" suppressHydrationWarning>{formatDateTime(l.at)}</span> },
  ];
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-4 text-muted" /> Security</CardTitle></CardHeader>
        <CardContent className="space-y-1 divide-y divide-border">
          <ToggleRow label="Two-factor authentication" hint="Require an authenticator code at sign-in." defaultOn />
          <ToggleRow label="Enforce 2FA for all members" hint="Members without 2FA will be prompted at next sign-in." />
          <ToggleRow label="SSO / SAML" hint="Available on Enterprise." />
          <ToggleRow label="Session timeout after 12 hours" defaultOn />
          <div className="pt-4"><Button variant="secondary" size="sm" onClick={() => toast.info("Password reset email sent")}>Change password</Button></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Active sessions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[{ d: "Windows · Chrome", loc: "Hyderabad, IN · 49.205.12.8", cur: true, i: <Laptop /> }, { d: "iPhone · LeadPulz app", loc: "Hyderabad, IN · 2 hours ago", cur: false, i: <Smartphone /> }].map((s) => <div key={s.d} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm"><span className="text-muted [&_svg]:size-4">{s.i}</span><span className="flex-1"><span className="font-medium">{s.d}</span><span className="block text-xs text-muted">{s.loc}</span></span>{s.cur ? <Badge variant="success">This device</Badge> : <Button variant="ghost" size="xs" onClick={() => toast.success("Session revoked")}>Revoke</Button>}</div>)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Audit log</CardTitle><CardDescription>Every sensitive action is recorded with actor, target and IP.</CardDescription></CardHeader>
        <CardContent className="p-0"><DataTable className="rounded-none border-0 shadow-none" columns={cols} rows={logs.data} rowKey={(l) => l.id} loading={logs.loading} dense /></CardContent>
      </Card>
    </div>
  );
}

export function WhiteLabelSection() {
  const [primary, setPrimary] = useState("#6161FF");
  const [accent, setAccent] = useState("#3AC9FF");
  return (
    <div className="space-y-6">
      <InlineAlert tone="info" title="Agency features">White-label branding, custom domains and client sub-accounts are available on the Enterprise plan. Settings here are saved and applied when the plan is upgraded.</InlineAlert>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="size-4 text-muted" /> Branding</CardTitle><CardDescription>Replace the LeadPulz logo, colours and product name for your clients.</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product name"><Input defaultValue="LeadPulz AI" /></Field>
            <Field label="Custom domain" hint="Point a CNAME at app.leadpulz.ai"><Input placeholder="app.youragency.com" /></Field>
            <Field label="Primary colour"><div className="flex gap-2"><Input value={primary} onChange={(e) => setPrimary(e.target.value)} className="font-mono" /><span className="size-9 shrink-0 rounded-lg border border-border" style={{ background: primary }} /></div></Field>
            <Field label="Accent colour"><div className="flex gap-2"><Input value={accent} onChange={(e) => setAccent(e.target.value)} className="font-mono" /><span className="size-9 shrink-0 rounded-lg border border-border" style={{ background: accent }} /></div></Field>
            <Field label="Logo" className="sm:col-span-2"><label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-border-strong px-4 py-6 text-sm text-muted hover:border-primary/60"><Upload className="mr-2 size-4" /> Upload SVG or PNG<input type="file" className="sr-only" /></label></Field>
          </div>
          <SaveBar />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex-row items-start justify-between"><div><CardTitle className="flex items-center gap-2"><Users className="size-4 text-muted" /> Client workspaces & sub-accounts</CardTitle><CardDescription>Manage multiple client organizations from one agency dashboard.</CardDescription></div><Button size="sm" variant="secondary" onClick={() => toast.info("Available on Enterprise")}><Plus /> Add client</Button></CardHeader>
        <CardContent>
          <div className="space-y-2">{[["Apex Dental Care", "growth", 4], ["Skyline Realty", "professional", 6]].map(([n, p, a]) => <div key={String(n)} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm"><span className="flex size-7 items-center justify-center rounded bg-gradient-to-br from-primary to-accent text-[10px] font-bold text-white">{String(n)[0]}</span><span className="flex-1 font-medium">{n}</span><Badge variant="muted" className="capitalize">{p}</Badge><span className="text-xs text-muted">{a} agents</span><Link href="/admin/organizations" className="text-xs text-[#a3a3ff] hover:underline">Open <ArrowRight className="inline size-3" /></Link></div>)}</div>
        </CardContent>
      </Card>
    </div>
  );
}

export function RedirectCard({ title, description, href, label }: { title: string; description: string; href: string; label: string }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
      <CardContent><Button asChild variant="secondary"><Link href={href}>{label} <ArrowRight /></Link></Button></CardContent>
    </Card>
  );
}

export { Textarea };
