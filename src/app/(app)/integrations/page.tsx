"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Check, Plug, Search, Settings2, Unplug, Zap, Calendar, Database, MessageSquare, ShoppingBag, CreditCard, Briefcase, Code2 } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import type { Integration, IntegrationCategory } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton, Switch } from "@/components/ui/primitives";
import { ErrorState, InlineAlert } from "@/components/ui/states";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/form";
import { SimpleSelect } from "@/components/ui/select";
import { INTEGRATION_CATEGORIES } from "@/lib/constants";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const catIcon: Record<IntegrationCategory, React.ReactNode> = { crm: <Database />, calendar: <Calendar />, communications: <MessageSquare />, automation: <Zap />, ecommerce: <ShoppingBag />, payments: <CreditCard />, productivity: <Briefcase />, api: <Code2 /> };

const brandColor: Record<string, string> = { hubspot: "#ff7a59", salesforce: "#00a1e0", zoho: "#e42527", pipedrive: "#017737", gohighlevel: "#2f80ed", google_calendar: "#4285f4", outlook_calendar: "#0078d4", calcom: "#292929", calendly: "#006bff", twilio: "#f22f46", whatsapp: "#25d366", gmail: "#ea4335", slack: "#4a154b", shopify: "#96bf48", stripe: "#635bff", zapier: "#ff4f00", make: "#6d00cc", n8n: "#ea4b71", webhooks: "#6161ff", rest_api: "#3ac9ff" };

function Mark({ name, k }: { name: string; k: string }) {
  return <span className="flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white" style={{ background: brandColor[k] ?? "#6161ff" }}>{name.slice(0, 2).toUpperCase()}</span>;
}

function IntegrationCard({ i, onChange }: { i: Integration; onChange: () => void }) {
  const [pending, setPending] = useState(false);
  const [configure, setConfigure] = useState(false);
  const connect = async () => {
    setPending(true);
    try {
      await services.integrations.connect(i.key);
      toast.success(`${i.name} connected`);
      onChange();
    } catch (e) { toast.error((e as Error).message); } finally { setPending(false); }
  };
  const disconnect = async () => {
    setPending(true);
    await services.integrations.disconnect(i.key);
    toast.success(`${i.name} disconnected`);
    setPending(false);
    onChange();
  };
  return (
    <Card className={cn("flex flex-col p-4", i.status === "error" && "border-danger/40")}>
      <div className="flex items-start gap-3">
        <Mark name={i.name} k={i.key} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold">{i.name}{i.premium ? <Badge variant="primary">Premium</Badge> : null}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted">{i.description}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted">
        {i.status === "connected" ? <Badge variant="success" dot>Connected</Badge> : i.status === "error" ? <Badge variant="danger" dot>Error</Badge> : <Badge variant="muted">Available</Badge>}
        {i.lastSyncAt ? <span suppressHydrationWarning>Synced {timeAgo(i.lastSyncAt)}</span> : null}
      </div>
      {i.errorMessage ? <p className="mt-2 flex items-start gap-1.5 text-[11px] text-danger"><AlertTriangle className="mt-0.5 size-3 shrink-0" />{i.errorMessage}</p> : null}
      <div className="mt-auto flex gap-2 pt-4">
        {i.status === "available" ? (
          <Button size="sm" className="flex-1" onClick={connect} loading={pending}>{!pending ? <Plug /> : null} Connect</Button>
        ) : (
          <>
            <Button size="sm" variant="secondary" className="flex-1" onClick={() => setConfigure(true)}><Settings2 /> Configure</Button>
            {i.status === "error" ? <Button size="sm" variant="secondary" onClick={connect} loading={pending}>Reconnect</Button> : null}
            <Button size="sm" variant="ghost" onClick={disconnect} loading={pending} aria-label="Disconnect"><Unplug /></Button>
          </>
        )}
      </div>
      <Dialog open={configure} onOpenChange={setConfigure}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-3"><Mark name={i.name} k={i.key} />{i.name}</DialogTitle><DialogDescription>Configure how LeadPulz syncs with {i.name}.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            {i.category === "crm" ? (
              <>
                <Field label="Sync direction"><SimpleSelect value="two_way" options={[{ value: "two_way", label: "Two-way (recommended)" }, { value: "to_crm", label: "LeadPulz → CRM only" }, { value: "from_crm", label: "CRM → LeadPulz only" }]} /></Field>
                <ToggleRow label="Create contacts for new leads" defaultOn />
                <ToggleRow label="Log calls as activities" defaultOn />
                <ToggleRow label="Create deals for qualified leads" defaultOn />
                <ToggleRow label="Sync appointments as meetings" />
              </>
            ) : i.category === "calendar" ? (
              <>
                <Field label="Default calendar"><SimpleSelect value="kavya" options={[{ value: "kavya", label: "Dr. Kavya Nair" }, { value: "anil", label: "Dr. Anil Kumar" }, { value: "clinic", label: "Clinic — shared" }]} /></Field>
                <Field label="Buffer between appointments"><SimpleSelect value="15" options={["0", "10", "15", "30"].map((v) => ({ value: v, label: `${v} min` }))} /></Field>
                <ToggleRow label="Allow agents to reschedule" defaultOn />
                <ToggleRow label="Allow agents to cancel" />
              </>
            ) : i.category === "communications" ? (
              <>
                <ToggleRow label="Send booking confirmations" defaultOn />
                <ToggleRow label="Send appointment reminders" defaultOn />
                <ToggleRow label="Allow agents to reply to inbound messages" defaultOn />
              </>
            ) : (
              <>
                <Field label="Events to send"><SimpleSelect value="all" options={[{ value: "all", label: "All events" }, { value: "leads", label: "Lead events only" }, { value: "calls", label: "Call events only" }]} /></Field>
                <ToggleRow label="Retry failed deliveries" defaultOn />
              </>
            )}
            <InlineAlert tone="info">Credentials are stored encrypted server-side and never exposed to the browser.</InlineAlert>
          </div>
          <DialogFooter><Button variant="secondary" onClick={() => setConfigure(false)}>Cancel</Button><Button onClick={() => { toast.success("Settings saved"); setConfigure(false); }}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function ToggleRow({ label, defaultOn }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"><span>{label}</span><Switch checked={on} onCheckedChange={setOn} /></div>;
}

export default function IntegrationsPage() {
  const { data, loading, error, refetch } = useQuery(() => services.integrations.list(), []);
  const [cat, setCat] = useState<"all" | IntegrationCategory>("all");
  const [q, setQ] = useState("");
  const rows = useMemo(() => (data ?? []).filter((i) => (cat === "all" || i.category === cat) && (!q || i.name.toLowerCase().includes(q.toLowerCase()))), [data, cat, q]);
  const connected = data?.filter((i) => i.status === "connected").length ?? 0;
  const errors = data?.filter((i) => i.status === "error") ?? [];

  return (
    <div>
      <PageHeader title="Integrations" description={`Connect LeadPulz to the tools you already use. ${connected} connected.`} actions={<Button onClick={() => document.getElementById("marketplace")?.scrollIntoView({ behavior: "smooth" })}><Plug /> Connect Integration</Button>}>
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="Search integrations…" value={q} onChange={(e) => setQ(e.target.value)} leftIcon={<Search />} className="w-full sm:w-64" />
          <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-background-subtle p-1">
            <button type="button" onClick={() => setCat("all")} className={cn("rounded-md px-2.5 py-1 text-xs font-medium", cat === "all" ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground")}>All</button>
            {INTEGRATION_CATEGORIES.map((c) => <button key={c.value} type="button" onClick={() => setCat(c.value)} className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium [&_svg]:size-3.5", cat === c.value ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground")}>{catIcon[c.value]}{c.label}</button>)}
          </div>
        </div>
      </PageHeader>
      {errors.length ? <InlineAlert tone="danger" title={`${errors.length} integration${errors.length > 1 ? "s" : ""} need attention`} className="mb-4">{errors.map((e) => e.name).join(", ")} — {errors[0].errorMessage}</InlineAlert> : null}
      <div id="marketplace">
        {error ? <ErrorState error={error} onRetry={refetch} /> : loading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}</div> : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{rows.map((i) => <IntegrationCard key={i.id} i={i} onChange={refetch} />)}</div>
        )}
      </div>
      <p className="mt-6 flex items-center gap-2 text-xs text-muted"><Check className="size-3.5 text-success" /> Need something else? Use Webhooks or the REST API — or build a custom integration on Zapier, Make or n8n.</p>
    </div>
  );
}
