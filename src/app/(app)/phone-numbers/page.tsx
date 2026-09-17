"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Link2, MessageCircle, MoreHorizontal, Phone, PhoneIncoming, PhoneOutgoing, Plus, ShoppingCart, Smartphone, Trash2, Bot, Mic } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import type { PhoneNumber } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Tip } from "@/components/ui/primitives";
import { EmptyState, ErrorState, InlineAlert } from "@/components/ui/states";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/primitives";
import { COUNTRIES } from "@/lib/constants";
import { formatCurrency, formatNumber } from "@/lib/format";
import { StatCard } from "@/components/ui/stat-card";

const capIcon: Record<PhoneNumber["capabilities"][number], React.ReactNode> = { voice: <Mic />, sms: <Smartphone />, whatsapp: <MessageCircle />, mms: <Smartphone /> };

function NumberDialog({ mode, open, onOpenChange, onDone }: { mode: "buy" | "existing" | "twilio" | null; open: boolean; onOpenChange: (o: boolean) => void; onDone: () => void }) {
  const [country, setCountry] = useState("India");
  const [area, setArea] = useState("040");
  const [caps, setCaps] = useState<PhoneNumber["capabilities"]>(["voice", "sms"]);
  const [number, setNumber] = useState("");
  const [pending, setPending] = useState(false);
  const suggestions = country === "India" ? ["+91 40 6969 1203", "+91 40 6969 1218", "+91 40 6969 1241"] : ["+1 (415) 555-0188", "+1 (415) 555-0121", "+1 (628) 555-0177"];
  const [picked, setPicked] = useState(suggestions[0]);
  const submit = async () => {
    setPending(true);
    try {
      if (mode === "buy") { await services.phoneNumbers.buy({ country, areaCode: area, capabilities: caps }); toast.success(`Number ${picked} provisioned`); }
      else { await services.phoneNumbers.connectExisting({ number, provider: mode === "twilio" ? "twilio" : "byoc" }); toast.success("Number connected — verification pending"); }
      onOpenChange(false); onDone();
    } catch (e) { toast.error((e as Error).message); } finally { setPending(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "buy" ? "Buy a LeadPulz number" : mode === "twilio" ? "Connect Twilio" : "Connect existing number"}</DialogTitle>
          <DialogDescription>{mode === "buy" ? "Instant provisioning. Billed monthly with your subscription." : mode === "twilio" ? "Import numbers from your Twilio account. Credentials are stored encrypted." : "Forward your existing business line to LeadPulz via SIP or carrier forwarding."}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {mode === "buy" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Country"><SimpleSelect value={country} onValueChange={setCountry} options={COUNTRIES.map((c) => ({ value: c, label: c }))} /></Field>
                <Field label="Area code"><Input value={area} onChange={(e) => setArea(e.target.value)} /></Field>
              </div>
              <Field label="Available numbers">
                <div className="space-y-1.5">{suggestions.map((s) => <button key={s} type="button" onClick={() => setPicked(s)} className={"flex w-full items-center justify-between rounded-lg border px-3 py-2 font-mono text-sm " + (picked === s ? "border-primary/60 bg-primary-soft" : "border-border hover:border-border-strong")}>{s}<span className="font-sans text-xs text-muted">₹799/mo</span></button>)}</div>
              </Field>
              <Field label="Capabilities">
                <div className="flex gap-3">{(["voice", "sms", "whatsapp"] as const).map((c) => <label key={c} className="flex items-center gap-2 text-sm capitalize"><Checkbox checked={caps.includes(c)} onCheckedChange={(v) => setCaps((cs) => (v ? [...cs, c] : cs.filter((x) => x !== c)))} />{c}</label>)}</div>
              </Field>
            </>
          ) : mode === "twilio" ? (
            <>
              <Field label="Account SID"><Input placeholder="AC••••••••••••••••" className="font-mono" /></Field>
              <Field label="Auth token"><Input type="password" placeholder="••••••••••••" /></Field>
              <Field label="Number to import"><Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="+91…" className="font-mono" /></Field>
            </>
          ) : (
            <>
              <Field label="Your number"><Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="+91 40 4567 8900" className="font-mono" /></Field>
              <Field label="Method"><SimpleSelect value="forward" options={[{ value: "forward", label: "Carrier call forwarding" }, { value: "sip", label: "SIP trunk" }]} /></Field>
              <InlineAlert tone="info">We&apos;ll call this number to verify ownership before activating.</InlineAlert>
            </>
          )}
        </div>
        <DialogFooter><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} loading={pending} disabled={mode !== "buy" && !number}>{mode === "buy" ? "Buy number" : "Connect"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PhoneNumbersContent() {
  const params = useSearchParams();
  const { data, loading, error, refetch } = useQuery(() => services.phoneNumbers.list(), []);
  const { data: agents } = useQuery(() => services.agents.list(), []);
  const [mode, setMode] = useState<"buy" | "existing" | "twilio" | null>(null);
  // Sync dialog state from URL params — intentional.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (params.get("new") === "1") setMode("buy"); }, [params]);

  const assign = async (n: PhoneNumber, agentId: string | null) => {
    await services.phoneNumbers.assignAgent(n.id, agentId);
    toast.success(agentId ? "Agent assigned" : "Agent unassigned");
    refetch();
  };

  const columns: Column<PhoneNumber>[] = [
    { key: "number", header: "Number", sortValue: (n) => n.number, cell: (n) => <div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-surface-2 text-muted"><Phone className="size-4" /></span><div><p className="font-mono font-medium">{n.number}</p><p className="text-xs text-muted">{n.friendlyName} · <span className="capitalize">{n.provider}</span></p></div></div> },
    { key: "country", header: "Country", cell: (n) => <span className="flex items-center gap-1.5"><span className="rounded bg-surface-2 px-1 font-mono text-[10px]">{n.countryCode}</span>{n.country}</span> },
    { key: "agent", header: "Agent", cell: (n) => n.agentName ? <span className="flex items-center gap-1.5 text-sm"><Bot className="size-3.5 text-[#a3a3ff]" />{n.agentName.split(" — ")[0]}</span> : <span className="text-xs text-faint">Unassigned</span> },
    { key: "in", header: "Incoming", sortValue: (n) => n.incomingCalls, cell: (n) => <span className="flex items-center gap-1 tabular-nums"><PhoneIncoming className="size-3.5 text-accent" />{formatNumber(n.incomingCalls)}</span> },
    { key: "out", header: "Outgoing", sortValue: (n) => n.outgoingCalls, cell: (n) => <span className="flex items-center gap-1 tabular-nums"><PhoneOutgoing className="size-3.5 text-[#a3a3ff]" />{formatNumber(n.outgoingCalls)}</span> },
    { key: "status", header: "Status", cell: (n) => n.status === "active" ? <Badge variant="success" dot>Active</Badge> : n.status === "pending" ? <Badge variant="warning" dot pulse>Pending</Badge> : <Badge variant="muted">Inactive</Badge> },
    { key: "caps", header: "Capabilities", cell: (n) => <span className="flex gap-1">{n.capabilities.map((c) => <Tip key={c} content={c.toUpperCase()}><span className="flex size-6 items-center justify-center rounded-md bg-surface-2 text-muted [&_svg]:size-3.5">{capIcon[c]}</span></Tip>)}</span> },
    { key: "cost", header: "Monthly", sortValue: (n) => n.monthlyCost, cell: (n) => <span className="tabular-nums">{n.monthlyCost ? formatCurrency(n.monthlyCost) : "—"}</span> },
    { key: "actions", header: "", className: "text-right", cell: (n) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="Actions"><MoreHorizontal /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Assign agent</DropdownMenuLabel>
          {agents?.map((a) => <DropdownMenuItem key={a.id} onClick={() => assign(n, a.id)}><Bot /> {a.name.split(" — ")[0]}</DropdownMenuItem>)}
          <DropdownMenuItem onClick={() => assign(n, null)}>Unassign</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onClick={async () => { await services.phoneNumbers.release(n.id); toast.success("Number released"); refetch(); }}><Trash2 /> Release number</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) },
  ];

  const totals = { in: data?.reduce((a, b) => a + b.incomingCalls, 0) ?? 0, out: data?.reduce((a, b) => a + b.outgoingCalls, 0) ?? 0, cost: data?.reduce((a, b) => a + b.monthlyCost, 0) ?? 0 };

  return (
    <div>
      <PageHeader title="Phone Numbers" description="Numbers your agents answer and call from." actions={<><Button variant="secondary" onClick={() => setMode("twilio")}><Link2 /> Connect Twilio</Button><Button variant="secondary" onClick={() => setMode("existing")}><Phone /> Connect Existing Number</Button><Button onClick={() => setMode("buy")}><ShoppingCart /> Buy Number</Button></>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Numbers" value={`${data?.length ?? 0} / 5`} hint="Growth plan limit" />
        <StatCard label="Incoming calls" value={formatNumber(totals.in)} />
        <StatCard label="Outgoing calls" value={formatNumber(totals.out)} />
        <StatCard label="Monthly cost" value={formatCurrency(totals.cost)} hint="Included in your invoice" />
      </div>
      {error ? <ErrorState error={error} onRetry={refetch} /> : !loading && data?.length === 0 ? (
        <EmptyState icon={<Phone />} title="No phone numbers" description="Buy a number or connect one you already own to start receiving calls." action={<Button onClick={() => setMode("buy")}><Plus /> Buy Number</Button>} />
      ) : <DataTable columns={columns} rows={data} rowKey={(n) => n.id} loading={loading} />}
      <NumberDialog mode={mode} open={!!mode} onOpenChange={(o) => !o && setMode(null)} onDone={refetch} />
    </div>
  );
}

export default function PhoneNumbersPage() {
  return <Suspense><PhoneNumbersContent /></Suspense>;
}
