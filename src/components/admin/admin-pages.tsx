"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Activity, Building2, MoreHorizontal, Search, ShieldAlert, ShieldCheck, LifeBuoy, RefreshCw } from "lucide-react";
import { adminKpis, adminOrgs, platformSeries, revenueByPlan, systemHealth } from "@/data/mock/analytics";
import { auditLogs, integrations } from "@/data/mock/platform";
import { agents } from "@/data/mock/agents";
import { calls } from "@/data/mock/calls";
import { members } from "@/data/mock/org";
import type { AdminOrgRow, AuditLog, SystemHealth } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard, formatKpi } from "@/components/ui/stat-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { Avatar, Progress } from "@/components/ui/primitives";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AreaSeriesChart, BarList, LineSeriesChart, SERIES, DonutChart } from "@/components/charts";
import { INDUSTRY_LABEL } from "@/lib/constants";
import { formatCurrency, formatDate, formatDateTime, formatDuration, formatNumber, formatPercent, formatCompact } from "@/lib/format";
import { AgentStatusBadge, OutcomeBadge } from "@/components/ui/domain-badges";

/*
 * Admin pages read from the demo dataset directly via a thin adapter so the
 * customer-facing service layer stays tenant-scoped. In production these call
 * platform-admin endpoints guarded by the `platform_admin` role.
 */

const orgStatus = (s: AdminOrgRow["status"]) => (s === "active" ? <Badge variant="success" dot>Active</Badge> : s === "trialing" ? <Badge variant="accent" dot>Trialing</Badge> : s === "past_due" ? <Badge variant="warning" dot>Past due</Badge> : <Badge variant="muted">Churned</Badge>);

export function AdminOverview() {
  return (
    <div>
      <PageHeader title="Platform overview" description="Health of the LeadPulz business across all tenants." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {adminKpis.map((k) => <StatCard key={k.key} label={k.label} value={formatKpi(k.value, k.format)} delta={((k.value - k.previous) / k.previous) * 100} invertDelta={k.key === "errors"} />)}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2"><CardHeader><CardTitle>MRR & call volume</CardTitle><CardDescription>Trailing 12 months.</CardDescription></CardHeader><CardContent><LineSeriesChart data={platformSeries} xKey="label" series={[{ key: "mrr", label: "MRR (₹)", color: SERIES[1] }]} formatter={(v) => `₹${formatCompact(v)}`} height={220} /><div className="mt-4"><AreaSeriesChart data={platformSeries} xKey="label" series={[{ key: "calls", label: "Monthly calls", color: SERIES[2] }]} height={160} /></div></CardContent></Card>
        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Revenue by plan</CardTitle></CardHeader><CardContent><BarList items={revenueByPlan.map((r) => ({ label: r.label, count: r.value }))} formatter={(v) => formatCurrency(v)} /></CardContent></Card>
          <Card><CardHeader><CardTitle>System status</CardTitle></CardHeader><CardContent className="space-y-2">{systemHealth.slice(0, 5).map((s) => <div key={s.service} className="flex items-center justify-between text-sm"><span>{s.service}</span>{s.status === "operational" ? <Badge variant="success" dot>OK</Badge> : <Badge variant="warning" dot>Degraded</Badge>}</div>)}</CardContent></Card>
        </div>
      </div>
    </div>
  );
}

export function AdminOrganizations() {
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState("all");
  const rows = useMemo(() => adminOrgs.filter((o) => (plan === "all" || o.plan === plan) && (!q || o.name.toLowerCase().includes(q.toLowerCase()))), [q, plan]);
  const cols: Column<AdminOrgRow>[] = [
    { key: "name", header: "Organization", sortValue: (o) => o.name, cell: (o) => <div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">{o.name[0]}</span><div><p className="font-medium">{o.name}</p><p className="text-xs text-muted">{INDUSTRY_LABEL[o.industry]} · {o.country}</p></div></div> },
    { key: "plan", header: "Plan", sortValue: (o) => o.plan, cell: (o) => <Badge variant="primary" className="capitalize">{o.plan}</Badge> },
    { key: "status", header: "Status", sortValue: (o) => o.status, cell: (o) => orgStatus(o.status) },
    { key: "agents", header: "Agents", sortValue: (o) => o.agents, cell: (o) => <span className="tabular-nums">{o.agents}</span> },
    { key: "calls", header: "Monthly calls", sortValue: (o) => o.monthlyCalls, cell: (o) => <span className="tabular-nums">{formatNumber(o.monthlyCalls)}</span> },
    { key: "min", header: "Minutes", sortValue: (o) => o.minutes, cell: (o) => <span className="tabular-nums">{formatNumber(o.minutes)}</span> },
    { key: "mrr", header: "MRR", sortValue: (o) => o.mrr, cell: (o) => <span className="font-medium tabular-nums">{formatCurrency(o.mrr)}</span> },
    { key: "created", header: "Since", sortValue: (o) => o.createdAt, cell: (o) => <span className="text-xs text-muted" suppressHydrationWarning>{formatDate(o.createdAt)}</span> },
    { key: "a", header: "", className: "text-right", cell: (o) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="Actions"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => toast.info(`Impersonating ${o.name} (read-only)`)}>Impersonate</DropdownMenuItem><DropdownMenuItem onClick={() => toast.success("Plan override applied")}>Change plan</DropdownMenuItem><DropdownMenuItem onClick={() => toast.success("Credit added")}>Add minutes credit</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem destructive onClick={() => toast.success(`${o.name} suspended`)}>Suspend</DropdownMenuItem></DropdownMenuContent></DropdownMenu> },
  ];
  return (
    <div>
      <PageHeader title="Organizations" description={`${adminOrgs.length} tenants · ${formatCurrency(adminOrgs.reduce((a, b) => a + b.mrr, 0))} MRR`}>
        <div className="flex flex-wrap gap-2"><Input placeholder="Search organizations…" value={q} onChange={(e) => setQ(e.target.value)} leftIcon={<Search />} className="w-full sm:w-64" /><SimpleSelect value={plan} onValueChange={setPlan} className="w-40" options={[{ value: "all", label: "All plans" }, { value: "starter", label: "Starter" }, { value: "growth", label: "Growth" }, { value: "professional", label: "Professional" }, { value: "enterprise", label: "Enterprise" }]} /></div>
      </PageHeader>
      <DataTable columns={cols} rows={rows} rowKey={(o) => o.id} />
    </div>
  );
}

export function AdminUsers() {
  const rows = [...members, ...members.map((m, i) => ({ ...m, id: `${m.id}_sky`, organizationId: "org_skyline", user: { ...m.user, fullName: ["Divya Menon", "Karan Bhatia", "Neel Rao", "Sana Khan", "Arvind Iyer", "Preethi S"][i] ?? m.user.fullName, email: `user${i}@skylinerealty.in` } }))];
  const cols: Column<(typeof rows)[number]>[] = [
    { key: "u", header: "User", cell: (m) => <div className="flex items-center gap-3"><Avatar name={m.user.fullName} size="sm" /><div><p className="font-medium">{m.user.fullName}</p><p className="text-xs text-muted">{m.user.email}</p></div></div> },
    { key: "org", header: "Organization", cell: (m) => adminOrgs.find((o) => o.id === m.organizationId)?.name ?? m.organizationId },
    { key: "role", header: "Role", cell: (m) => <Badge variant="default" className="capitalize">{m.role.replace("_", " ")}</Badge> },
    { key: "status", header: "Status", cell: (m) => m.status === "active" ? <Badge variant="success" dot>Active</Badge> : <Badge variant="warning" dot>Invited</Badge> },
    { key: "joined", header: "Joined", sortValue: (m) => m.joinedAt, cell: (m) => <span className="text-xs text-muted" suppressHydrationWarning>{formatDate(m.joinedAt)}</span> },
    { key: "a", header: "", className: "text-right", cell: () => <Button variant="ghost" size="xs" onClick={() => toast.success("Password reset email sent")}>Reset password</Button> },
  ];
  return <div><PageHeader title="Users" description={`${rows.length} users across all organizations.`} /><DataTable columns={cols} rows={rows} rowKey={(m) => m.id} /></div>;
}

export function AdminSubscriptions() {
  const cols: Column<AdminOrgRow>[] = [
    { key: "n", header: "Organization", cell: (o) => <span className="font-medium">{o.name}</span> },
    { key: "p", header: "Plan", cell: (o) => <Badge variant="primary" className="capitalize">{o.plan}</Badge> },
    { key: "s", header: "Status", cell: (o) => orgStatus(o.status) },
    { key: "m", header: "MRR", sortValue: (o) => o.mrr, cell: (o) => <span className="tabular-nums">{formatCurrency(o.mrr)}</span> },
    { key: "r", header: "Renews", cell: () => <span className="text-xs text-muted">1st of month</span> },
    { key: "a", header: "", className: "text-right", cell: (o) => o.status === "past_due" ? <Button variant="secondary" size="xs" onClick={() => toast.success("Payment retry queued")}><RefreshCw /> Retry payment</Button> : null },
  ];
  const counts = { active: adminOrgs.filter((o) => o.status === "active").length, trial: adminOrgs.filter((o) => o.status === "trialing").length, pastDue: adminOrgs.filter((o) => o.status === "past_due").length, churn: adminOrgs.filter((o) => o.status === "churned").length };
  return (
    <div>
      <PageHeader title="Subscriptions" description="Plan distribution, renewals and dunning." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Active" value={counts.active} /><StatCard label="Trialing" value={counts.trial} /><StatCard label="Past due" value={counts.pastDue} /><StatCard label="Churned (90d)" value={counts.churn} /></div>
      <DataTable columns={cols} rows={adminOrgs} rowKey={(o) => o.id} />
    </div>
  );
}

export function AdminUsage() {
  const total = adminOrgs.reduce((a, b) => a + b.minutes, 0);
  return (
    <div>
      <PageHeader title="Usage" description="Voice minutes and calls consumed per tenant this month." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3"><StatCard label="Voice minutes" value={formatNumber(total)} delta={14.3} /><StatCard label="Calls" value={formatNumber(adminOrgs.reduce((a, b) => a + b.monthlyCalls, 0))} delta={11.9} /><StatCard label="Avg. minutes / org" value={formatNumber(Math.round(total / adminOrgs.filter((o) => o.minutes).length))} /></div>
      <Card><CardHeader><CardTitle>Minutes by organization</CardTitle></CardHeader><CardContent><BarList items={[...adminOrgs].sort((a, b) => b.minutes - a.minutes).map((o) => ({ label: o.name, count: o.minutes }))} formatter={(v) => `${formatNumber(v)} min`} /></CardContent></Card>
    </div>
  );
}

export function AdminAgents() {
  const rows = agents.map((a) => ({ ...a, orgName: "Apex Dental Care" }));
  const cols: Column<(typeof rows)[number]>[] = [
    { key: "n", header: "Agent", cell: (a) => <span className="font-medium">{a.name}</span> },
    { key: "o", header: "Organization", cell: (a) => a.orgName },
    { key: "t", header: "Provider", cell: (a) => <Badge variant="muted" className="capitalize">{a.voice.provider}</Badge> },
    { key: "s", header: "Status", cell: (a) => <AgentStatusBadge status={a.status} /> },
    { key: "c", header: "Total calls", sortValue: (a) => a.stats.callsTotal, cell: (a) => <span className="tabular-nums">{formatNumber(a.stats.callsTotal)}</span> },
    { key: "cv", header: "Conversion", sortValue: (a) => a.stats.conversionRate, cell: (a) => formatPercent(a.stats.conversionRate) },
    { key: "v", header: "Version", cell: (a) => <span className="font-mono text-xs">v{a.version}</span> },
  ];
  return <div><PageHeader title="Agents" description={`${adminKpis[2].value.toLocaleString()} active agents platform-wide. Showing a sample tenant.`} /><DataTable columns={cols} rows={rows} rowKey={(a) => a.id} /></div>;
}

export function AdminCalls() {
  const rows = calls.slice(0, 60);
  const cols: Column<(typeof rows)[number]>[] = [
    { key: "c", header: "Customer", cell: (c) => <span className="font-medium">{c.customerName}</span> },
    { key: "a", header: "Agent", cell: (c) => c.agentName.split(" — ")[0] },
    { key: "d", header: "Direction", cell: (c) => <span className="capitalize">{c.direction}</span> },
    { key: "dur", header: "Duration", sortValue: (c) => c.durationSec, cell: (c) => <span className="font-mono text-xs">{formatDuration(c.durationSec)}</span> },
    { key: "o", header: "Outcome", cell: (c) => <OutcomeBadge outcome={c.outcome} /> },
    { key: "cost", header: "Minutes billed", cell: (c) => <span className="tabular-nums">{c.costMinutes}</span> },
    { key: "at", header: "Started", sortValue: (c) => c.startedAt, cell: (c) => <span className="whitespace-nowrap text-xs text-muted" suppressHydrationWarning>{formatDateTime(c.startedAt)}</span> },
  ];
  const failed = calls.filter((c) => c.status === "failed").length;
  return (
    <div>
      <PageHeader title="Calls" description="Platform-wide call stream for debugging and QA." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3"><StatCard label="Calls (24h)" value={formatNumber(6_142)} delta={4.2} /><StatCard label="Success rate" value={formatPercent(98.4)} delta={0.3} /><StatCard label="Failed (sample)" value={failed} hint="Mostly carrier SIP 503" /></div>
      <DataTable columns={cols} rows={rows} rowKey={(c) => c.id} dense />
    </div>
  );
}

export function AdminRevenue() {
  const total = revenueByPlan.reduce((a, b) => a + b.value, 0);
  return (
    <div>
      <PageHeader title="Revenue" description="MRR, ARR and plan mix." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="MRR" value={formatCurrency(total)} delta={13.3} /><StatCard label="ARR" value={formatCurrency(total * 12)} delta={13.3} /><StatCard label="ARPA" value={formatCurrency(Math.round(total / 241))} delta={2.1} /><StatCard label="Net revenue churn" value="1.8%" delta={-0.4} invertDelta /></div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2"><CardHeader><CardTitle>MRR trend</CardTitle></CardHeader><CardContent><AreaSeriesChart data={platformSeries} xKey="label" series={[{ key: "mrr", label: "MRR", color: SERIES[1] }]} formatter={(v) => formatCurrency(v)} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Plan mix</CardTitle></CardHeader><CardContent><DonutChart height={170} centerValue={formatCompact(total)} centerLabel="MRR" data={revenueByPlan.map((r, i) => ({ label: r.label, value: r.value, color: SERIES[(i + 1) as 1 | 2 | 3 | 4] }))} /></CardContent></Card>
      </div>
    </div>
  );
}

export function AdminSystemHealth() {
  const cols: Column<SystemHealth>[] = [
    { key: "s", header: "Service", cell: (s) => <span className="flex items-center gap-2 font-medium"><Activity className="size-4 text-muted" />{s.service}</span> },
    { key: "st", header: "Status", cell: (s) => s.status === "operational" ? <Badge variant="success" dot>Operational</Badge> : s.status === "degraded" ? <Badge variant="warning" dot pulse>Degraded</Badge> : <Badge variant="danger" dot pulse>Outage</Badge> },
    { key: "l", header: "p95 latency", sortValue: (s) => s.latencyMs, cell: (s) => <span className="font-mono text-xs">{s.latencyMs} ms</span> },
    { key: "u", header: "Uptime (30d)", sortValue: (s) => s.uptime, cell: (s) => <span className="flex items-center gap-2 tabular-nums">{s.uptime}%<Progress value={s.uptime} className="w-20" tone={s.uptime > 99.9 ? "success" : "warning"} /></span> },
    { key: "e", header: "Error rate", sortValue: (s) => s.errorRate, cell: (s) => <span className={"tabular-nums " + (s.errorRate > 1 ? "text-warning" : "")}>{s.errorRate}%</span> },
  ];
  const degraded = systemHealth.filter((s) => s.status !== "operational");
  return (
    <div>
      <PageHeader title="System health" description="Live status of platform services." actions={<Button variant="secondary" onClick={() => toast.success("Status page refreshed")}><RefreshCw /> Refresh</Button>} />
      {degraded.length ? <Card className="mb-6 flex items-center gap-3 border-warning/40 p-4 text-sm"><ShieldAlert className="size-5 text-warning" /><span><span className="font-medium">{degraded.map((d) => d.service).join(", ")} degraded.</span> TTS provider failover to secondary region is active; latency elevated.</span></Card> : <Card className="mb-6 flex items-center gap-3 border-success/40 p-4 text-sm"><ShieldCheck className="size-5 text-success" /> All systems operational.</Card>}
      <DataTable columns={cols} rows={systemHealth} rowKey={(s) => s.service} />
    </div>
  );
}

export function AdminIntegrations() {
  const rows = integrations.map((i) => ({ ...i, tenants: Math.floor(20 + (i.name.length * 7) % 180), errors24h: i.status === "error" ? 3 : Math.floor((i.name.length * 3) % 5) }));
  const cols: Column<(typeof rows)[number]>[] = [
    { key: "n", header: "Integration", cell: (i) => <span className="font-medium">{i.name}</span> },
    { key: "c", header: "Category", cell: (i) => <Badge variant="muted" className="capitalize">{i.category}</Badge> },
    { key: "t", header: "Tenants connected", sortValue: (i) => i.tenants, cell: (i) => <span className="tabular-nums">{i.tenants}</span> },
    { key: "e", header: "Errors (24h)", sortValue: (i) => i.errors24h, cell: (i) => <span className={"tabular-nums " + (i.errors24h > 2 ? "text-danger" : "")}>{i.errors24h}</span> },
    { key: "s", header: "Provider status", cell: (i) => i.errors24h > 2 ? <Badge variant="danger" dot>Investigating</Badge> : <Badge variant="success" dot>Healthy</Badge> },
  ];
  return <div><PageHeader title="Integrations" description="Marketplace integrations — adoption and error rates across tenants." /><DataTable columns={cols} rows={rows} rowKey={(i) => i.id} /></div>;
}

export function AdminSupport() {
  const tickets = [
    { id: "T-1042", org: "TalentBridge Recruitment", subject: "Payment failed — card declined", priority: "high", status: "open", age: "2h" },
    { id: "T-1041", org: "Glow Salon & Spa", subject: "How do I connect Calendly?", priority: "low", status: "open", age: "5h" },
    { id: "T-1039", org: "Apex Dental Care", subject: "n8n webhook returning 502", priority: "medium", status: "pending", age: "1d" },
    { id: "T-1036", org: "MediCity Clinics", subject: "Request: Kannada voice for Nisha", priority: "medium", status: "open", age: "2d" },
    { id: "T-1030", org: "Spice Route Restaurants", subject: "Reservation slots not syncing to Google Calendar", priority: "high", status: "resolved", age: "4d" },
  ];
  const cols: Column<(typeof tickets)[number]>[] = [
    { key: "id", header: "Ticket", cell: (t) => <span className="font-mono text-xs">{t.id}</span> },
    { key: "org", header: "Organization", cell: (t) => t.org },
    { key: "s", header: "Subject", cell: (t) => <span className="font-medium">{t.subject}</span> },
    { key: "p", header: "Priority", cell: (t) => <Badge variant={t.priority === "high" ? "danger" : t.priority === "medium" ? "warning" : "muted"} className="capitalize">{t.priority}</Badge> },
    { key: "st", header: "Status", cell: (t) => <Badge variant={t.status === "open" ? "accent" : t.status === "pending" ? "warning" : "success"} dot className="capitalize">{t.status}</Badge> },
    { key: "a", header: "Age", cell: (t) => <span className="text-xs text-muted">{t.age}</span> },
    { key: "x", header: "", className: "text-right", cell: () => <Button variant="ghost" size="xs" onClick={() => toast.info("Opening ticket…")}>Open</Button> },
  ];
  return <div><PageHeader title="Support" description="Customer tickets across tenants." actions={<Button variant="secondary" onClick={() => toast.info("Helpdesk sync triggered")}><LifeBuoy /> Sync helpdesk</Button>} /><DataTable columns={cols} rows={tickets} rowKey={(t) => t.id} /></div>;
}

export function AdminAuditLogs() {
  const cols: Column<AuditLog>[] = [
    { key: "at", header: "When", sortValue: (l) => l.at, cell: (l) => <span className="whitespace-nowrap text-xs text-muted" suppressHydrationWarning>{formatDateTime(l.at)}</span> },
    { key: "org", header: "Organization", cell: (l) => <span className="flex items-center gap-1.5"><Building2 className="size-3.5 text-muted" />{adminOrgs.find((o) => o.id === l.organizationId)?.name ?? "Platform"}</span> },
    { key: "actor", header: "Actor", cell: (l) => <span className="font-medium">{l.actor}</span> },
    { key: "action", header: "Action", cell: (l) => <span className="font-mono text-xs">{l.action}</span> },
    { key: "target", header: "Target", cell: (l) => <span className="text-foreground-secondary">{l.target}</span> },
    { key: "ip", header: "IP", cell: (l) => <span className="font-mono text-xs text-muted">{l.ip ?? "—"}</span> },
  ];
  return <div><PageHeader title="Audit logs" description="Immutable record of sensitive actions across the platform." /><DataTable columns={cols} rows={auditLogs} rowKey={(l) => l.id} /></div>;
}
