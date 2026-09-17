"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Kanban, List, Plus, Search, Upload, UserSquare2 } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import type { Lead, LeadStage } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Avatar, Skeleton } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { LeadQualityBadge, LeadStageBadge, ScorePill } from "@/components/ui/domain-badges";
import { LeadKanban } from "@/components/leads/kanban";
import { LeadDialog } from "@/components/leads/lead-dialog";
import { LEAD_STAGES } from "@/lib/constants";
import { formatCurrency, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

function LeadsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { data, loading, error, refetch, setData } = useQuery(() => services.leads.list({ pageSize: 500 }), []);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<string>(params.get("stage") ?? "all");
  const [quality, setQuality] = useState("all");
  const [open, setOpen] = useState(params.get("new") === "1");

  // Sync view state from URL params — intentional.
   
  useEffect(() => {
    if (params.get("new") === "1") setOpen(true);
    const s = params.get("stage");
    if (s) { setStage(s); setView("table"); }
  }, [params]);

  const leads = useMemo(
    () => (data?.items ?? []).filter((l) => (stage === "all" || l.stage === stage) && (quality === "all" || l.quality === quality) && (!q || [l.name, l.phone, l.email, l.company, l.serviceInterest].some((f) => f?.toLowerCase().includes(q.toLowerCase())))),
    [data, q, stage, quality],
  );

  const move = (id: string, s: LeadStage) => setData((prev) => ({ ...(prev ?? { total: 0, page: 1, pageSize: 500, items: [] }), items: (prev?.items ?? []).map((l) => (l.id === id ? { ...l, stage: s } : l)) }));

  const columns: Column<Lead>[] = [
    { key: "name", header: "Name", sortValue: (l) => l.name, cell: (l) => (
      <div className="flex items-center gap-3"><Avatar name={l.name} size="sm" /><div className="min-w-0"><p className="truncate font-medium">{l.name}</p><p className="truncate text-xs text-muted">{l.company ?? l.serviceInterest}</p></div></div>
    ) },
    { key: "phone", header: "Phone", cell: (l) => <span className="font-mono text-xs">{l.phone}</span> },
    { key: "email", header: "Email", cell: (l) => <span className="text-xs text-foreground-secondary">{l.email ?? "—"}</span> },
    { key: "source", header: "Source", cell: (l) => <span className="text-xs capitalize text-foreground-secondary">{l.source.replace("_", " ")}</span> },
    { key: "score", header: "Score", sortValue: (l) => l.score, cell: (l) => <span className="flex items-center gap-2"><ScorePill score={l.score} /><LeadQualityBadge quality={l.quality} /></span> },
    { key: "agent", header: "AI Agent", cell: (l) => l.agentName ?? "—" },
    { key: "last", header: "Last conversation", sortValue: (l) => l.lastConversationAt ?? "", cell: (l) => <span className="whitespace-nowrap text-xs text-muted" suppressHydrationWarning>{l.lastConversationAt ? formatRelative(l.lastConversationAt) : "—"}</span> },
    { key: "value", header: "Est. value", sortValue: (l) => l.estimatedValue, cell: (l) => <span className="tabular-nums">{l.estimatedValue ? formatCurrency(l.estimatedValue) : "—"}</span> },
    { key: "stage", header: "Stage", sortValue: (l) => l.stage, cell: (l) => <LeadStageBadge stage={l.stage} /> },
    { key: "tags", header: "Tags", cell: (l) => <span className="flex flex-wrap gap-1">{l.tags.slice(0, 2).map((t) => <Badge key={t} variant="muted">{t}</Badge>)}</span> },
  ];

  const total = leads.reduce((a, b) => a + b.estimatedValue, 0);

  return (
    <div>
      <PageHeader
        title="Leads"
        description={`${data?.total ?? 0} leads · ${formatCurrency(total)} in pipeline`}
        actions={
          <>
            <Button variant="secondary" onClick={() => router.push("/campaigns/new?step=contacts")}><Upload /> Import</Button>
            <Button onClick={() => setOpen(true)}><Plus /> Add Lead</Button>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="Search leads…" value={q} onChange={(e) => setQ(e.target.value)} leftIcon={<Search />} className="w-full sm:w-64" />
          <SimpleSelect value={stage} onValueChange={setStage} className="w-48" options={[{ value: "all", label: "All stages" }, ...LEAD_STAGES.map((s) => ({ value: s.value, label: s.label }))]} />
          <SimpleSelect value={quality} onValueChange={setQuality} className="w-40" options={[{ value: "all", label: "All qualities" }, { value: "hot", label: "Hot" }, { value: "warm", label: "Warm" }, { value: "cold", label: "Cold" }, { value: "not_qualified", label: "Not qualified" }]} />
          <div className="ml-auto inline-flex rounded-lg border border-border bg-background-subtle p-1">
            <button type="button" onClick={() => setView("kanban")} className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs", view === "kanban" ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground")}><Kanban className="size-3.5" /> Kanban</button>
            <button type="button" onClick={() => setView("table")} className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs", view === "table" ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground")}><List className="size-3.5" /> Table</button>
          </div>
        </div>
      </PageHeader>

      {error ? <ErrorState error={error} onRetry={refetch} /> : loading ? (
        <div className="flex gap-3 overflow-hidden">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[420px] w-[272px] shrink-0 rounded-2xl" />)}</div>
      ) : data?.items.length === 0 ? (
        <EmptyState icon={<UserSquare2 />} title="No leads yet" description="Leads are created automatically from every qualified conversation, or you can add them manually." action={<Button onClick={() => setOpen(true)}><Plus /> Add Lead</Button>} />
      ) : view === "kanban" ? (
        <LeadKanban leads={leads} onMove={move} />
      ) : (
        <DataTable columns={columns} rows={leads} rowKey={(l) => l.id} onRowClick={(l) => router.push(`/leads/${l.id}`)} emptyTitle="No leads match your filters" />
      )}
      <LeadDialog open={open} onOpenChange={setOpen} onCreated={() => refetch()} />
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense>
      <LeadsContent />
    </Suspense>
  );
}
