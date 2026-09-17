"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Bot, LayoutGrid, List, Plus, Search } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/primitives";
import { DataTable, type Column } from "@/components/ui/data-table";
import { AgentStatusBadge } from "@/components/ui/domain-badges";
import { AgentActionsMenu, AgentCard } from "@/components/agents/agent-card";
import { AGENT_TYPE_LABEL, LANGUAGE_LABEL } from "@/lib/constants";
import { formatPercent, timeAgo } from "@/lib/format";
import type { Agent } from "@/types";
import { cn } from "@/lib/utils";

export default function AgentsPage() {
  const router = useRouter();
  const { data, loading, error, refetch } = useQuery(() => services.agents.list(), []);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(
    () => (data ?? []).filter((a) => (status === "all" || a.status === status) && (!q || a.name.toLowerCase().includes(q.toLowerCase()) || a.role.toLowerCase().includes(q.toLowerCase()))),
    [data, q, status],
  );

  const columns: Column<Agent>[] = [
    { key: "name", header: "Agent", sortValue: (a) => a.name, cell: (a) => (
      <div className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-[#a3a3ff]"><Bot className="size-4" /></span>
        <div className="min-w-0">
          <p className="truncate font-medium">{a.name}</p>
          <p className="truncate text-xs text-muted">{a.role}</p>
        </div>
      </div>
    ) },
    { key: "type", header: "Type", cell: (a) => <span className="text-foreground-secondary">{AGENT_TYPE_LABEL[a.type]}</span> },
    { key: "phone", header: "Phone number", cell: (a) => <span className="font-mono text-xs">{a.phoneNumber ?? <span className="text-muted">—</span>}</span> },
    { key: "voice", header: "Voice", cell: (a) => `${a.voice.voiceName} · ${a.voice.accent}` },
    { key: "lang", header: "Language", cell: (a) => LANGUAGE_LABEL[a.voice.language] },
    { key: "callsToday", header: "Calls today", sortValue: (a) => a.stats.callsToday, cell: (a) => <span className="tabular-nums">{a.stats.callsToday}</span> },
    { key: "conv", header: "Conversion", sortValue: (a) => a.stats.conversionRate, cell: (a) => <span className="tabular-nums">{formatPercent(a.stats.conversionRate)}</span> },
    { key: "status", header: "Status", sortValue: (a) => a.status, cell: (a) => <AgentStatusBadge status={a.status} /> },
    { key: "last", header: "Last active", sortValue: (a) => a.lastActiveAt ?? "", cell: (a) => <span className="text-muted" suppressHydrationWarning>{a.lastActiveAt ? timeAgo(a.lastActiveAt) : "Never"}</span> },
    { key: "actions", header: "", className: "text-right", cell: (a) => <AgentActionsMenu agent={a} onChange={refetch} /> },
  ];

  return (
    <div>
      <PageHeader
        title="AI Agents"
        description="Create and manage AI agents that talk to your customers 24/7."
        actions={
          <Button asChild>
            <Link href="/agents/new">
              <Plus /> Create Agent
            </Link>
          </Button>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="Search agents…" value={q} onChange={(e) => setQ(e.target.value)} leftIcon={<Search />} className="w-full sm:w-64" />
          <SimpleSelect value={status} onValueChange={setStatus} className="w-36" options={[{ value: "all", label: "All statuses" }, { value: "active", label: "Active" }, { value: "paused", label: "Paused" }, { value: "draft", label: "Draft" }]} />
          <div className="ml-auto inline-flex rounded-lg border border-border bg-background-subtle p-1">
            <button type="button" onClick={() => setView("grid")} className={cn("rounded-md p-1.5", view === "grid" ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground")} aria-label="Grid view"><LayoutGrid className="size-4" /></button>
            <button type="button" onClick={() => setView("table")} className={cn("rounded-md p-1.5", view === "table" ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground")} aria-label="Table view"><List className="size-4" /></button>
          </div>
        </div>
      </PageHeader>

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : data?.length === 0 ? (
        <EmptyState
          icon={<Bot />}
          title="No AI agents yet."
          description={<span className="font-medium text-foreground-secondary">Build your first AI Revenue Agent and start turning conversations into opportunities.</span>}
          action={<Button asChild><Link href="/agents/new"><Plus /> Create AI Agent</Link></Button>}
        />
      ) : view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((a) => <AgentCard key={a.id} agent={a} onChange={refetch} />)}
          {rows.length === 0 ? <div className="md:col-span-2 xl:col-span-3"><EmptyState compact title="No agents match your filters" /></div> : null}
        </div>
      ) : (
        <DataTable columns={columns} rows={rows} rowKey={(a) => a.id} onRowClick={(a) => router.push(`/agents/${a.id}`)} emptyTitle="No agents match your filters" />
      )}
    </div>
  );
}
