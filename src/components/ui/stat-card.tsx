"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDuration, formatNumber, formatPercent } from "@/lib/format";
import type { KpiValue } from "@/types";
import { Skeleton } from "./primitives";

export function formatKpi(value: number, fmt: KpiValue["format"]) {
  switch (fmt) {
    case "currency":
      return formatCurrency(value);
    case "percent":
      return formatPercent(value);
    case "duration":
      return formatDuration(value);
    default:
      return formatNumber(value);
  }
}

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  delta?: number; // percent change vs previous
  deltaLabel?: string;
  invertDelta?: boolean; // when lower is better
  icon?: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
  sparkline?: number[];
  size?: "md" | "lg";
}

export function StatCard({ label, value, delta, deltaLabel = "vs previous period", invertDelta, icon, hint, className, sparkline, size = "md" }: StatCardProps) {
  const positive = delta !== undefined && (invertDelta ? delta < 0 : delta > 0);
  const negative = delta !== undefined && (invertDelta ? delta > 0 : delta < 0);
  return (
    <div className={cn("group relative min-w-0 overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-card transition-colors hover:border-border-strong sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-muted sm:text-[13px]">{label}</p>
        {icon ? <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-[#a3a3ff] [&_svg]:size-4">{icon}</span> : null}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className={cn("min-w-0 truncate font-semibold tracking-tight text-foreground tabular-nums", size === "lg" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl")}>{value}</p>
        {sparkline?.length ? <span className="hidden sm:block"><Sparkline data={sparkline} positive={!negative} /></span> : null}
      </div>
      {delta !== undefined ? (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium tabular-nums",
              positive && "bg-success-soft text-success",
              negative && "bg-danger-soft text-danger",
              !positive && !negative && "bg-elevated text-muted",
            )}
          >
            {positive ? <ArrowUpRight className="size-3" /> : negative ? <ArrowDownRight className="size-3" /> : <Minus className="size-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
          <span className="hidden text-muted sm:inline">{deltaLabel}</span>
        </div>
      ) : hint ? (
        <p className="mt-2 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function KpiCard({ kpi, icon, sparkline }: { kpi: KpiValue; icon?: React.ReactNode; sparkline?: number[] }) {
  const delta = kpi.previous === 0 ? 0 : ((kpi.value - kpi.previous) / kpi.previous) * 100;
  return <StatCard label={kpi.label} value={formatKpi(kpi.value, kpi.format)} delta={delta} icon={icon} sparkline={sparkline} invertDelta={kpi.key === "avg_duration"} />;
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="mt-3 h-7 w-32" />
      <Skeleton className="mt-3 h-4 w-40" />
    </div>
  );
}

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const w = 72;
  const h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  });
  const color = positive ? "var(--lp-success)" : "var(--lp-danger)";
  return (
    <svg width={w} height={h} className="shrink-0 opacity-80" aria-hidden>
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" points={pts.join(" ")} />
    </svg>
  );
}
