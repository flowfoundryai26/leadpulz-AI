"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, BookOpen, Check, Copy, KeyRound, Plus, RefreshCw, Trash2, Webhook, XCircle } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import type { ApiKey, WebhookEndpoint, WebhookLog } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/primitives";
import { InlineAlert } from "@/components/ui/states";
import { formatDateTime, formatRelative } from "@/lib/format";
import { API_BASE_URL } from "@/lib/constants";

const SCOPES = ["calls:read", "calls:write", "leads:read", "leads:write", "agents:read", "agents:write", "appointments:read", "appointments:write", "campaigns:write", "analytics:read"];
const EVENTS = ["call.started", "call.completed", "lead.created", "lead.qualified", "lead.score_changed", "appointment.booked", "appointment.cancelled", "campaign.completed", "agent.error"];

function copy(text: string) {
  navigator.clipboard?.writeText(text);
  toast.success("Copied to clipboard");
}

export function ApiSettings() {
  const keys = useQuery(() => services.apiSettings.listKeys(), []);
  const hooks = useQuery(() => services.apiSettings.listWebhooks(), []);
  const logs = useQuery(() => services.apiSettings.getWebhookLogs(), []);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["calls:write", "leads:read"]);
  const [secret, setSecret] = useState<string | null>(null);
  const [hookOpen, setHookOpen] = useState(false);
  const [hookUrl, setHookUrl] = useState("");
  const [hookEvents, setHookEvents] = useState<string[]>(["call.completed", "lead.qualified"]);
  const [pending, setPending] = useState(false);

  const createKey = async () => {
    setPending(true);
    const r = await services.apiSettings.createKey({ name, scopes });
    setPending(false);
    setSecret(r.secret);
    setName("");
    keys.refetch();
  };

  const keyCols: Column<ApiKey>[] = [
    { key: "name", header: "Name", cell: (k) => <span className="flex items-center gap-2 font-medium"><KeyRound className="size-4 text-muted" />{k.name}</span> },
    { key: "key", header: "Key", cell: (k) => <span className="font-mono text-xs">{k.maskedKey}</span> },
    { key: "scopes", header: "Scopes", cell: (k) => <span className="flex flex-wrap gap-1">{k.scopes.slice(0, 3).map((s) => <Badge key={s} variant="muted">{s}</Badge>)}{k.scopes.length > 3 ? <Badge variant="muted">+{k.scopes.length - 3}</Badge> : null}</span> },
    { key: "last", header: "Last used", cell: (k) => <span className="text-xs text-muted" suppressHydrationWarning>{k.lastUsedAt ? formatRelative(k.lastUsedAt) : "Never"}</span> },
    { key: "status", header: "Status", cell: (k) => k.status === "active" ? <Badge variant="success" dot>Active</Badge> : <Badge variant="danger">Revoked</Badge> },
    { key: "actions", header: "", className: "text-right", cell: (k) => k.status === "active" ? (
      <span className="flex justify-end gap-1">
        <Button variant="ghost" size="xs" onClick={async () => { const r = await services.apiSettings.regenerateKey(k.id); setSecret(r.secret); keys.refetch(); }}><RefreshCw /> Regenerate</Button>
        <Button variant="danger-ghost" size="xs" onClick={async () => { await services.apiSettings.revokeKey(k.id); toast.success("Key revoked"); keys.refetch(); }}><XCircle /> Revoke</Button>
      </span>
    ) : null },
  ];

  const hookCols: Column<WebhookEndpoint>[] = [
    { key: "url", header: "Endpoint", cell: (w) => <span className="font-mono text-xs">{w.url}</span> },
    { key: "events", header: "Events", cell: (w) => <span className="flex flex-wrap gap-1">{w.events.map((e) => <Badge key={e} variant="muted">{e}</Badge>)}</span> },
    { key: "secret", header: "Signing secret", cell: (w) => <span className="font-mono text-xs">{w.secretMasked}</span> },
    { key: "status", header: "Status", cell: (w) => <Badge variant={w.status === "active" ? "success" : "muted"} dot>{w.status}</Badge> },
    { key: "actions", header: "", className: "text-right", cell: (w) => <Button variant="danger-ghost" size="xs" onClick={async () => { await services.apiSettings.deleteWebhook(w.id); toast.success("Webhook deleted"); hooks.refetch(); }}><Trash2 /></Button> },
  ];

  const logCols: Column<WebhookLog>[] = [
    { key: "event", header: "Event", cell: (l) => <span className="font-mono text-xs">{l.event}</span> },
    { key: "endpoint", header: "Endpoint", cell: (l) => <span className="truncate font-mono text-xs text-muted">{hooks.data?.find((h) => h.id === l.endpointId)?.url ?? l.endpointId}</span> },
    { key: "status", header: "Response", cell: (l) => <Badge variant={l.success ? "success" : "danger"}>{l.statusCode}</Badge> },
    { key: "dur", header: "Duration", cell: (l) => <span className="font-mono text-xs">{l.durationMs} ms</span> },
    { key: "at", header: "Time", sortValue: (l) => l.at, cell: (l) => <span className="whitespace-nowrap text-xs text-muted" suppressHydrationWarning>{formatDateTime(l.at)}</span> },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div><CardTitle>API keys</CardTitle><CardDescription>Authenticate requests to the LeadPulz REST API. Keys are shown once and stored hashed.</CardDescription></div>
          <Button size="sm" onClick={() => setCreateOpen(true)}><Plus /> Create API Key</Button>
        </CardHeader>
        <CardContent className="p-0"><DataTable className="rounded-none border-0 shadow-none" columns={keyCols} rows={keys.data} rowKey={(k) => k.id} loading={keys.loading} dense /></CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div><CardTitle>Quick start</CardTitle><CardDescription>Place an outbound AI call with one request.</CardDescription></div>
          <Button asChild variant="secondary" size="sm"><a href="https://docs.leadpulz.ai" target="_blank" rel="noreferrer"><BookOpen /> API documentation</a></Button>
        </CardHeader>
        <CardContent>
          <div className="relative rounded-xl border border-border bg-background-subtle p-4 font-mono text-xs leading-relaxed text-foreground-secondary">
            <button type="button" onClick={() => copy(`curl -X POST ${API_BASE_URL}/v1/calls -H "Authorization: Bearer lp_live_..." -H "Content-Type: application/json" -d '{"agent_id":"agt_maya","to":"+919849122334","objective":"Follow up on implant enquiry"}'`)} className="absolute right-3 top-3 rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground" aria-label="Copy"><Copy className="size-4" /></button>
            <span className="text-success">POST</span> <span className="text-foreground">{API_BASE_URL}/v1/calls</span>
            <br /><br />
            <span className="text-muted">Authorization:</span> Bearer lp_live_••••••••<br />
            <span className="text-muted">Content-Type:</span> application/json<br /><br />
            {`{`}<br />
            &nbsp;&nbsp;<span className="text-accent">&quot;agent_id&quot;</span>: <span className="text-warning">&quot;agt_maya&quot;</span>,<br />
            &nbsp;&nbsp;<span className="text-accent">&quot;to&quot;</span>: <span className="text-warning">&quot;+919849122334&quot;</span>,<br />
            &nbsp;&nbsp;<span className="text-accent">&quot;objective&quot;</span>: <span className="text-warning">&quot;Follow up on implant enquiry&quot;</span>,<br />
            &nbsp;&nbsp;<span className="text-accent">&quot;metadata&quot;</span>: {`{ `}<span className="text-accent">&quot;lead_id&quot;</span>: <span className="text-warning">&quot;lead_rahul&quot;</span>{` }`}<br />
            {`}`}
          </div>
          <p className="mt-3 text-xs text-muted">Rate limit: 120 requests/min per key. All endpoints are tenant-scoped — a key can only access its own organization&apos;s data.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div><CardTitle className="flex items-center gap-2"><Webhook className="size-4 text-muted" /> Webhooks</CardTitle><CardDescription>Receive signed JSON payloads. Verify with the <code className="font-mono">X-LeadPulz-Signature</code> header (HMAC-SHA256).</CardDescription></div>
          <Button size="sm" variant="secondary" onClick={() => setHookOpen(true)}><Plus /> Add endpoint</Button>
        </CardHeader>
        <CardContent className="p-0"><DataTable className="rounded-none border-0 shadow-none" columns={hookCols} rows={hooks.data} rowKey={(w) => w.id} loading={hooks.loading} dense /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Webhook logs</CardTitle><CardDescription>Last 7 deliveries. Failed deliveries retry with exponential backoff for 24 hours.</CardDescription></CardHeader>
        {logs.data?.some((l) => !l.success) ? <CardContent className="pt-0 pb-3"><InlineAlert tone="warning" title="Some deliveries are failing"><span className="flex items-center gap-1"><AlertTriangle className="size-3" /> n8n endpoint returned 502 three times. Check the receiver.</span></InlineAlert></CardContent> : null}
        <CardContent className="p-0"><DataTable className="rounded-none border-0 shadow-none" columns={logCols} rows={logs.data} rowKey={(l) => l.id} loading={logs.loading} dense /></CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) setSecret(null); }}>
        <DialogContent>
          {secret ? (
            <>
              <DialogHeader><DialogTitle className="flex items-center gap-2"><Check className="size-5 text-success" /> API key created</DialogTitle><DialogDescription>Copy it now — for security we won&apos;t show it again.</DialogDescription></DialogHeader>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background-subtle p-3 font-mono text-xs"><span className="flex-1 break-all">{secret}</span><Button variant="secondary" size="xs" onClick={() => copy(secret)}><Copy /> Copy</Button></div>
              <DialogFooter><Button onClick={() => { setCreateOpen(false); setSecret(null); }}>Done</Button></DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader><DialogTitle>Create API key</DialogTitle><DialogDescription>Scope keys to the minimum access needed.</DialogDescription></DialogHeader>
              <div className="space-y-4">
                <Field label="Name" required><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Production — Website" /></Field>
                <Field label="Scopes"><div className="grid grid-cols-2 gap-2">{SCOPES.map((s) => <label key={s} className="flex items-center gap-2 text-xs"><Checkbox checked={scopes.includes(s)} onCheckedChange={(v) => setScopes((sc) => (v ? [...sc, s] : sc.filter((x) => x !== s)))} /><span className="font-mono">{s}</span></label>)}</div></Field>
              </div>
              <DialogFooter><Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={createKey} loading={pending} disabled={!name || !scopes.length}>Create key</Button></DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={hookOpen} onOpenChange={setHookOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add webhook endpoint</DialogTitle><DialogDescription>We&apos;ll send a test event after saving.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <Field label="Endpoint URL" required><Input value={hookUrl} onChange={(e) => setHookUrl(e.target.value)} placeholder="https://example.com/webhooks/leadpulz" className="font-mono text-xs" /></Field>
            <Field label="Events"><div className="grid grid-cols-2 gap-2">{EVENTS.map((e) => <label key={e} className="flex items-center gap-2 text-xs"><Checkbox checked={hookEvents.includes(e)} onCheckedChange={(v) => setHookEvents((ev) => (v ? [...ev, e] : ev.filter((x) => x !== e)))} /><span className="font-mono">{e}</span></label>)}</div></Field>
          </div>
          <DialogFooter><Button variant="secondary" onClick={() => setHookOpen(false)}>Cancel</Button><Button onClick={async () => { setPending(true); await services.apiSettings.createWebhook({ url: hookUrl, events: hookEvents }); setPending(false); setHookOpen(false); setHookUrl(""); toast.success("Webhook added — test event delivered (200)"); hooks.refetch(); }} loading={pending} disabled={!hookUrl.startsWith("http")}>Add endpoint</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
