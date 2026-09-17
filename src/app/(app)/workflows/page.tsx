"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Pause, Play, Plus, Workflow as WorkflowIcon, Zap } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import type { Workflow } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/primitives";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { DataTable, type Column } from "@/components/ui/data-table";
import { WORKFLOW_TRIGGER_LABEL, WORKFLOW_ACTIONS } from "@/lib/constants";
import { formatNumber, formatPercent, timeAgo, formatDateTime } from "@/lib/format";
import { actionIcon } from "@/components/workflows/workflow-editor";
import { cn } from "@/lib/utils";

function WorkflowCard({ w, onChange }: { w: Workflow; onChange: () => void }) {
  const router = useRouter();
  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = w.status === "active" ? "paused" : "active";
    await services.workflows.setStatus(w.id, next);
    toast.success(next === "active" ? "Workflow activated" : "Workflow paused");
    onChange();
  };
  return (
    <Card interactive className="p-5" onClick={() => router.push(`/workflows/${w.id}`)}>
      <div className="flex items-start gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent"><Zap className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{w.name}</p>
          <p className="text-xs text-muted">When <span className="text-foreground-secondary">{WORKFLOW_TRIGGER_LABEL[w.trigger]}</span>{w.triggerFilter ? <span className="font-mono"> · {w.triggerFilter}</span> : null}</p>
        </div>
        <Badge variant={w.status === "active" ? "success" : w.status === "paused" ? "warning" : "muted"} dot pulse={w.status === "active"} className="capitalize">{w.status}</Badge>
        <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label="Toggle">{w.status === "active" ? <Pause /> : <Play />}</Button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {w.steps.map((s, i) => (
          <span key={s.id} className="flex items-center gap-1.5">
            <span className={cn("inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] [&_svg]:size-3", s.type === "condition" ? "border-warning/40 bg-warning-soft text-warning" : s.type === "wait" ? "border-border bg-surface-2 text-muted" : "border-border bg-surface-2 text-foreground-secondary")}>{actionIcon[s.type]}{WORKFLOW_ACTIONS.find((a) => a.value === s.type)?.label}</span>
            {i < w.steps.length - 1 ? <ArrowRight className="size-3 text-faint" /> : null}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-6 text-xs text-muted">
        <span><span className="font-semibold text-foreground">{formatNumber(w.runs)}</span> runs</span>
        <span><span className="font-semibold text-foreground">{formatPercent(w.successRate)}</span> success</span>
        {w.lastRunAt ? <span className="ml-auto" suppressHydrationWarning>Last run {timeAgo(w.lastRunAt)}</span> : null}
      </div>
    </Card>
  );
}

export default function WorkflowsPage() {
  const { data, loading, error, refetch } = useQuery(() => services.workflows.list(), []);
  const runs = useQuery(() => services.workflows.getRuns(), []);
  const runCols: Column<NonNullable<typeof runs.data>[number]>[] = [
    { key: "wf", header: "Workflow", cell: (r) => <span className="font-medium">{r.workflowName}</span> },
    { key: "ref", header: "Triggered by", cell: (r) => r.triggerRef },
    { key: "status", header: "Status", cell: (r) => <Badge variant={r.status === "success" ? "success" : r.status === "failed" ? "danger" : "accent"} dot pulse={r.status === "running"} className="capitalize">{r.status}</Badge> },
    { key: "err", header: "Details", cell: (r) => <span className="text-xs text-muted">{r.error ?? `${r.durationMs} ms`}</span> },
    { key: "at", header: "Started", sortValue: (r) => r.startedAt, cell: (r) => <span className="whitespace-nowrap text-xs text-muted" suppressHydrationWarning>{formatDateTime(r.startedAt)}</span> },
  ];
  return (
    <div>
      <PageHeader title="Workflows" description="Event-driven automation: when something happens in LeadPulz, do something in your stack." actions={<Button asChild><Link href="/workflows/new"><Plus /> Create Workflow</Link></Button>} />
      {error ? <ErrorState error={error} onRetry={refetch} /> : loading ? <div className="grid gap-4 lg:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div> : data?.length ? (
        <div className="grid gap-4 lg:grid-cols-2">{data.map((w) => <WorkflowCard key={w.id} w={w} onChange={refetch} />)}</div>
      ) : <EmptyState icon={<WorkflowIcon />} title="No workflows yet" description="Automate follow-ups, CRM updates and team alerts." action={<Button asChild><Link href="/workflows/new"><Plus /> Create Workflow</Link></Button>} />}
      <Card className="mt-8">
        <CardHeader><CardTitle>Recent runs</CardTitle></CardHeader>
        <CardContent className="p-0"><DataTable className="rounded-none border-0 shadow-none" columns={runCols} rows={runs.data} rowKey={(r) => r.id} loading={runs.loading} dense pageSize={8} /></CardContent>
      </Card>
    </div>
  );
}
