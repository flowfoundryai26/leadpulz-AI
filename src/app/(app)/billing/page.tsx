"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowUpRight, Check, CreditCard, Download, Sparkles, Info } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import type { Plan, PlanTier } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress, Skeleton } from "@/components/ui/primitives";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { InlineAlert } from "@/components/ui/states";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/types";

export default function BillingPage() {
  const plans = useQuery(() => services.billing.getPlans(), []);
  const sub = useQuery(() => services.billing.getSubscription(), []);
  const usage = useQuery(() => services.billing.getUsage(), []);
  const invoices = useQuery(() => services.billing.getInvoices(), []);
  const [changeTo, setChangeTo] = useState<Plan | null>(null);
  const [pending, setPending] = useState(false);

  const current = plans.data?.find((p) => p.tier === sub.data?.plan);
  const u = usage.data;
  const minutesPct = u ? (u.minutesUsed / u.minutesIncluded) * 100 : 0;

  const confirm = async () => {
    if (!changeTo) return;
    setPending(true);
    await services.billing.changePlan(changeTo.tier);
    setPending(false);
    toast.success(`Plan changed to ${changeTo.name}`, { description: "Prorated charges will appear on your next invoice." });
    setChangeTo(null);
    sub.refetch();
  };

  const invoiceCols: Column<Invoice>[] = [
    { key: "n", header: "Invoice", cell: (i) => <span className="font-mono text-xs">{i.number}</span> },
    { key: "d", header: "Date", sortValue: (i) => i.date, cell: (i) => <span suppressHydrationWarning>{formatDate(i.date)}</span> },
    { key: "a", header: "Amount", cell: (i) => <span className="tabular-nums">{formatCurrency(i.amount)}</span> },
    { key: "s", header: "Status", cell: (i) => <Badge variant={i.status === "paid" ? "success" : i.status === "open" ? "warning" : "danger"} dot className="capitalize">{i.status}</Badge> },
    { key: "pdf", header: "", className: "text-right", cell: () => <Button variant="ghost" size="xs" onClick={() => toast.success("Downloading invoice PDF")}><Download /> PDF</Button> },
  ];

  return (
    <div>
      <PageHeader title="Billing" description="Plan, usage and invoices. Pricing = subscription + usage minutes + phone numbers + premium integrations." actions={<Button onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}><ArrowUpRight /> Upgrade plan</Button>} />

      {minutesPct > 65 ? <InlineAlert tone="warning" title={`You've used ${minutesPct.toFixed(0)}% of your AI voice minutes`} className="mb-6" action={<Button size="xs" variant="secondary" onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}>Compare plans</Button>}>Overage is billed at {formatCurrency(current?.perMinuteOverage ?? 5)}/minute. Upgrading to Professional includes 15,000 minutes.</InlineAlert> : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="relative overflow-hidden xl:col-span-1">
          <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/15 blur-3xl" />
          <CardHeader><CardDescription>Current plan</CardDescription><CardTitle className="text-2xl">{current?.name ?? <Skeleton className="h-7 w-24" />}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-3xl font-semibold tabular-nums">{current?.monthlyPrice ? formatCurrency(current.monthlyPrice) : "Custom"}<span className="text-sm font-normal text-muted"> / month</span></p>
            <p className="text-muted" suppressHydrationWarning>Renews {sub.data ? formatDate(sub.data.currentPeriodEnd) : "—"} · {sub.data?.seats} seats</p>
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <CreditCard className="size-5 text-muted" />
              <span className="flex-1">{sub.data?.paymentMethod?.brand} •••• {sub.data?.paymentMethod?.last4}<span className="block text-xs text-muted">Expires {sub.data?.paymentMethod?.expiry}</span></span>
              <Button variant="ghost" size="xs" onClick={() => toast.info("Opening secure payment portal…")}>Update</Button>
            </div>
            <Badge variant="success" dot>Subscription {sub.data?.status}</Badge>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Usage this period</CardTitle><CardDescription>Estimated cost so far: <span className="font-semibold text-foreground">{u ? formatCurrency(u.estimatedCost) : "—"}</span></CardDescription></CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            {!u ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />) : (
              <>
                <Meter label="AI voice minutes" used={u.minutesUsed} total={u.minutesIncluded} suffix="min" tone={minutesPct > 85 ? "warning" : "primary"} sub={`${formatNumber(u.minutesIncluded - u.minutesUsed)} remaining`} />
                <Meter label="Calls" used={u.calls} total={0} sub="Unlimited on Growth" />
                <Meter label="AI agents" used={u.agentsUsed} total={u.agentsIncluded} tone="accent" />
                <Meter label="Phone numbers" used={u.numbersUsed} total={u.numbersIncluded} tone="accent" sub={`${formatCurrency(2247)} / month`} />
                <div className="rounded-lg border border-border p-3 text-sm sm:col-span-2">
                  <p className="mb-2 flex items-center gap-1.5 text-xs text-muted"><Info className="size-3.5" /> Cost breakdown (estimate)</p>
                  <div className="grid grid-cols-2 gap-1 text-xs sm:grid-cols-4">
                    {[["Subscription", 14_999], ["Usage minutes", 0], ["Phone numbers", 2_247], ["Premium integrations", 0]].map(([l, v]) => <div key={String(l)}><p className="text-muted">{l}</p><p className="font-medium tabular-nums">{formatCurrency(Number(v))}</p></div>)}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <h2 id="plans" className="mb-1 mt-10 text-lg font-semibold">Plans</h2>
      <p className="mb-4 text-sm text-muted">Prices shown are placeholders and configurable per region. Enterprise pricing is custom.</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.loading ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-80 rounded-2xl" />) : plans.data?.map((p) => {
          const isCurrent = p.tier === sub.data?.plan;
          return (
            <Card key={p.tier} className={cn("flex flex-col p-5", p.highlighted && "border-primary/50 shadow-glow", isCurrent && "bg-primary-soft/20")}>
              <div className="flex items-center justify-between"><p className="text-lg font-semibold">{p.name}</p>{p.highlighted ? <Badge variant="primary"><Sparkles className="size-3" /> Popular</Badge> : null}{isCurrent ? <Badge variant="success">Current</Badge> : null}</div>
              <p className="mt-3 text-3xl font-semibold tabular-nums">{p.monthlyPrice ? formatCurrency(p.monthlyPrice) : "Custom"}<span className="text-sm font-normal text-muted">{p.monthlyPrice ? " / mo" : ""}</span></p>
              <p className="mt-1 text-xs text-muted">{formatNumber(p.includedMinutes)} minutes · {p.maxAgents >= 999 ? "Unlimited" : p.maxAgents} agents · {p.maxNumbers >= 999 ? "Unlimited" : p.maxNumbers} numbers</p>
              <p className="text-xs text-muted">Overage {formatCurrency(p.perMinuteOverage)}/min</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">{p.features.map((f) => <li key={f} className="flex gap-2 text-foreground-secondary"><Check className="mt-0.5 size-4 shrink-0 text-success" />{f}</li>)}</ul>
              <Button className="mt-5" variant={isCurrent ? "secondary" : p.highlighted ? "primary" : "outline"} disabled={isCurrent} onClick={() => (p.tier === "enterprise" ? toast.info("Our team will reach out within 1 business day.") : setChangeTo(p))}>{isCurrent ? "Current plan" : p.tier === "enterprise" ? "Contact sales" : "Switch to " + p.name}</Button>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8">
        <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
        <CardContent className="p-0"><DataTable className="rounded-none border-0 shadow-none" columns={invoiceCols} rows={invoices.data} rowKey={(i) => i.id} loading={invoices.loading} dense /></CardContent>
      </Card>

      <Dialog open={!!changeTo} onOpenChange={(o) => !o && setChangeTo(null)}>
        <DialogContent size="sm">
          <DialogHeader><DialogTitle>Switch to {changeTo?.name}?</DialogTitle><DialogDescription>Your new plan starts immediately. We&apos;ll prorate the difference on your next invoice.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="secondary" onClick={() => setChangeTo(null)}>Cancel</Button><Button onClick={confirm} loading={pending}>Confirm change</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Meter({ label, used, total, suffix, tone = "primary", sub }: { label: string; used: number; total: number; suffix?: string; tone?: "primary" | "accent" | "warning"; sub?: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-end justify-between"><span className="text-sm text-foreground-secondary">{label}</span><span className="text-sm font-semibold tabular-nums">{formatNumber(used)}{total ? ` / ${formatNumber(total)}` : ""}{suffix ? ` ${suffix}` : ""}</span></div>
      {total ? <Progress value={(used / total) * 100} tone={tone} /> : <Progress value={100} tone="accent" indicatorClassName="opacity-40" />}
      {sub ? <p className="mt-1 text-[11px] text-muted">{sub}</p> : null}
    </div>
  );
}

export type { PlanTier };
