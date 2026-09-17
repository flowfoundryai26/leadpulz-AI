"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Download, Play, PhoneIncoming, PhoneOutgoing, Search, Radio } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import type { Call } from "@/types";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { Avatar, Tip } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { OutcomeBadge, ScorePill, SentimentBadge } from "@/components/ui/domain-badges";
import { ErrorState } from "@/components/ui/states";
import { formatDuration, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const filters = [
  { key: "all", label: "All" },
  { key: "inbound", label: "Inbound" },
  { key: "outbound", label: "Outbound" },
  { key: "qualified", label: "Qualified" },
  { key: "booked", label: "Booked" },
  { key: "transferred", label: "Transferred" },
  { key: "missed", label: "Missed" },
  { key: "completed", label: "Completed" },
  { key: "failed", label: "Failed" },
];

export function CallsTable({ leadId, compact }: { leadId?: string; compact?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [filter, setFilter] = useState(params.get("filter") ?? "all");
  const [q, setQ] = useState("");
  const [agentId, setAgentId] = useState("all");
  const { data: agents } = useQuery(() => services.agents.list(), []);

  // Sync filter from URL params — intentional.
   
  useEffect(() => {
    const f = params.get("filter");
    if (f) setFilter(f);
  }, [params]);

  const query = useQuery(
    () =>
      leadId
        ? services.leads.getCalls(leadId).then((items) => ({ items, total: items.length, page: 1, pageSize: items.length }))
        : services.calls.list({
            pageSize: 500,
            direction: filter === "inbound" || filter === "outbound" ? filter : undefined,
            outcome: !["all", "inbound", "outbound"].includes(filter) ? filter : undefined,
            agentId: agentId === "all" ? undefined : agentId,
            search: q || undefined,
          }),
    [filter, q, agentId, leadId],
  );

  const columns = useMemo<Column<Call>[]>(
    () => [
      {
        key: "customer",
        header: "Customer",
        sortValue: (c) => c.customerName,
        cell: (c) => (
          <div className="flex items-center gap-3">
            <Avatar name={c.customerName} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium">{c.customerName}</p>
              <p className="truncate text-xs text-muted">{c.intent}</p>
            </div>
          </div>
        ),
      },
      { key: "phone", header: "Phone", cell: (c) => <span className="font-mono text-xs text-foreground-secondary">{c.customerPhone}</span> },
      { key: "agent", header: "Agent", cell: (c) => <span className="text-foreground-secondary">{c.agentName.split(" — ")[0]}</span> },
      {
        key: "direction",
        header: "Direction",
        cell: (c) => (
          <span className={cn("inline-flex items-center gap-1.5 text-xs", c.direction === "inbound" ? "text-accent" : "text-[#a3a3ff]")}>
            {c.direction === "inbound" ? <PhoneIncoming className="size-3.5" /> : <PhoneOutgoing className="size-3.5" />}
            {c.direction === "inbound" ? "Inbound" : "Outbound"}
          </span>
        ),
      },
      { key: "duration", header: "Duration", sortValue: (c) => c.durationSec, cell: (c) => <span className="font-mono text-xs tabular-nums">{c.durationSec ? formatDuration(c.durationSec) : "—"}</span> },
      { key: "outcome", header: "Outcome", sortValue: (c) => c.outcome, cell: (c) => <OutcomeBadge outcome={c.outcome} status={c.status} /> },
      { key: "score", header: "Lead score", sortValue: (c) => c.leadScore, cell: (c) => <ScorePill score={c.leadScore} /> },
      { key: "sentiment", header: "Sentiment", cell: (c) => <SentimentBadge sentiment={c.sentiment} /> },
      { key: "date", header: "Date", sortValue: (c) => c.startedAt, cell: (c) => <span className="whitespace-nowrap text-xs text-muted" suppressHydrationWarning>{formatRelative(c.startedAt)}</span> },
      {
        key: "recording",
        header: "Recording",
        cell: (c) =>
          c.recordingUrl ? (
            <span className="flex items-center gap-1">
              <Tip content="Play recording">
                <Button variant="ghost" size="icon-xs" aria-label="Play" onClick={(e) => { e.stopPropagation(); router.push(`/calls/${c.id}#recording`); }}>
                  <Play />
                </Button>
              </Tip>
              <Tip content="Download">
                <Button variant="ghost" size="icon-xs" aria-label="Download" onClick={(e) => e.stopPropagation()}>
                  <Download />
                </Button>
              </Tip>
            </span>
          ) : (
            <span className="text-xs text-faint">—</span>
          ),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        cell: (c) => (
          <Button asChild variant="ghost" size="xs" onClick={(e) => e.stopPropagation()}>
            <Link href={`/calls/${c.id}`}>Details</Link>
          </Button>
        ),
      },
    ],
    [router],
  );

  return (
    <div className="space-y-4">
      {!compact ? (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-background-subtle p-1">
            {filters.map((f) => (
              <button key={f.key} type="button" onClick={() => setFilter(f.key)} className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors", filter === f.key ? "bg-surface-2 text-foreground shadow-sm" : "text-muted hover:text-foreground")}>
                {f.label}
              </button>
            ))}
          </div>
          <Input placeholder="Search customer, phone or intent…" value={q} onChange={(e) => setQ(e.target.value)} leftIcon={<Search />} className="w-full sm:w-72" />
          <SimpleSelect value={agentId} onValueChange={setAgentId} className="w-56" options={[{ value: "all", label: "All agents" }, ...(agents ?? []).map((a) => ({ value: a.id, label: a.name }))]} />
          <Button asChild variant="secondary" size="sm" className="ml-auto">
            <Link href="/calls/live">
              <Radio className="text-accent" /> Live calls <Badge variant="accent" className="ml-1">3</Badge>
            </Link>
          </Button>
        </div>
      ) : null}
      {query.error ? (
        <ErrorState error={query.error} onRetry={query.refetch} compact />
      ) : (
        <DataTable columns={compact ? columns.filter((c) => !["phone", "recording", "agent"].includes(c.key)) : columns} rows={query.data?.items} rowKey={(c) => c.id} loading={query.loading} onRowClick={(c) => router.push(`/calls/${c.id}`)} pageSize={compact ? 5 : 15} emptyTitle="No calls match these filters" emptyDescription="Try a different filter, or make an outbound call to get started." />
      )}
    </div>
  );
}
