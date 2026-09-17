"use client";

/**
 * Reusable chart components (Recharts).
 * Categorical palette is validated for the dark surface (see globals.css).
 * Series identity is always carried by legend + direct labels, never color alone.
 */
import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

export const SERIES = {
  1: "var(--lp-chart-1)",
  2: "var(--lp-chart-2)",
  3: "var(--lp-chart-3)",
  4: "var(--lp-chart-4)",
  5: "var(--lp-chart-5)",
  6: "var(--lp-chart-6)",
} as const;

const axisStyle = { fontSize: 11, fill: "var(--lp-muted)" };
const gridStroke = "rgba(125,134,156,0.14)";

export interface SeriesDef {
  key: string;
  label: string;
  color: string;
}

/* Tooltip */
export function ChartTooltip({
  active,
  payload,
  label,
  formatter = (v: number) => formatNumber(v),
  series,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string | number; value?: number | string; color?: string; name?: string }>;
  label?: string | number;
  formatter?: (v: number, key: string) => string;
  series?: SeriesDef[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-elevated px-3 py-2 text-xs shadow-card">
      <p className="mb-1.5 font-medium text-foreground">{label}</p>
      <ul className="space-y-1">
        {payload.map((p, i) => {
          const def = series?.find((s) => s.key === p.dataKey);
          return (
            <li key={i} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted">
                <span className="size-2 rounded-full" style={{ background: def?.color ?? p.color }} />
                {def?.label ?? p.name ?? String(p.dataKey)}
              </span>
              <span className="font-medium tabular-nums text-foreground">{formatter(Number(p.value ?? 0), String(p.dataKey))}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ChartLegend({ series, active, onToggle, className }: { series: SeriesDef[]; active?: Set<string>; onToggle?: (key: string) => void; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs", className)}>
      {series.map((s) => {
        const on = !active || active.has(s.key);
        return (
          <li key={s.key}>
            <button
              type="button"
              onClick={onToggle ? () => onToggle(s.key) : undefined}
              className={cn("flex items-center gap-1.5 text-foreground-secondary transition-opacity", !on && "opacity-40", onToggle && "hover:text-foreground")}
            >
              <span className="size-2.5 rounded-sm" style={{ background: s.color }} />
              {s.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* Area chart with toggleable series */
export function AreaSeriesChart({
  data,
  xKey,
  series,
  height = 280,
  formatter,
  stacked,
}: {
  data: object[];
  xKey: string;
  series: SeriesDef[];
  height?: number;
  formatter?: (v: number, key: string) => string;
  stacked?: boolean;
}) {
  const [active, setActive] = React.useState<Set<string>>(new Set(series.map((s) => s.key)));
  const toggle = (k: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(k)) {
        if (next.size === 1) return prev;
        next.delete(k);
      } else next.add(k);
      return next;
    });
  return (
    <div>
      <ChartLegend series={series} active={active} onToggle={toggle} className="mb-3" />
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke={gridStroke} vertical={false} />
            <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} minTickGap={24} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={44} />
            <Tooltip content={<ChartTooltip series={series} formatter={formatter} />} cursor={{ stroke: "rgba(125,134,156,0.35)", strokeDasharray: "3 3" }} />
            {series
              .filter((s) => active.has(s.key))
              .map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={2}
                  fill={`url(#grad-${s.key})`}
                  stackId={stacked ? "a" : undefined}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--lp-surface)" }}
                  isAnimationActive
                  animationDuration={600}
                />
              ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* Simple line chart */
export function LineSeriesChart({
  data,
  xKey,
  series,
  height = 240,
  formatter,
}: {
  data: object[];
  xKey: string;
  series: SeriesDef[];
  height?: number;
  formatter?: (v: number, key: string) => string;
}) {
  return (
    <div>
      {series.length > 1 ? <ChartLegend series={series} className="mb-3" /> : null}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke={gridStroke} vertical={false} />
            <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} minTickGap={24} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => (formatter ? formatter(Number(v), "") : String(v))} />
            <Tooltip content={<ChartTooltip series={series} formatter={formatter} />} cursor={{ stroke: "rgba(125,134,156,0.35)" }} />
            {series.map((s) => (
              <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} animationDuration={600} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* Vertical bars (single or grouped) */
export function BarSeriesChart({
  data,
  xKey,
  series,
  height = 240,
  formatter,
  stacked,
}: {
  data: object[];
  xKey: string;
  series: SeriesDef[];
  height?: number;
  formatter?: (v: number, key: string) => string;
  stacked?: boolean;
}) {
  return (
    <div>
      {series.length > 1 ? <ChartLegend series={series} className="mb-3" /> : null}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barCategoryGap="28%" barGap={2}>
            <CartesianGrid stroke={gridStroke} vertical={false} />
            <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={44} />
            <Tooltip content={<ChartTooltip series={series} formatter={formatter} />} cursor={{ fill: "rgba(125,134,156,0.08)" }} />
            {series.map((s, i) => (
              <Bar key={s.key} dataKey={s.key} fill={s.color} stackId={stacked ? "a" : undefined} radius={stacked && i !== series.length - 1 ? 0 : [4, 4, 0, 0]} animationDuration={600} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* Horizontal bar list — for topics/questions/objections */
export function BarList({
  items,
  color = SERIES[1],
  formatter = (v: number) => formatNumber(v),
  showDelta,
  className,
  maxItems,
}: {
  items: Array<{ label: string; count: number; delta?: number }>;
  color?: string;
  formatter?: (v: number) => string;
  showDelta?: boolean;
  className?: string;
  maxItems?: number;
}) {
  const rows = maxItems ? items.slice(0, maxItems) : items;
  const max = Math.max(...rows.map((i) => i.count), 1);
  return (
    <ul className={cn("space-y-2.5", className)}>
      {rows.map((it) => (
        <li key={it.label} className="group">
          <div className="mb-1 flex items-center justify-between gap-3 text-[13px]">
            <span className="truncate text-foreground-secondary group-hover:text-foreground">{it.label}</span>
            <span className="flex shrink-0 items-center gap-2 tabular-nums">
              {showDelta && it.delta !== undefined ? (
                <span className={cn("text-[11px]", it.delta > 0 ? "text-success" : it.delta < 0 ? "text-danger" : "text-muted")}>
                  {it.delta > 0 ? "+" : ""}
                  {it.delta}%
                </span>
              ) : null}
              <span className="font-medium text-foreground">{formatter(it.count)}</span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(it.count / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* Donut */
export function DonutChart({
  data,
  height = 200,
  centerLabel,
  centerValue,
}: {
  data: Array<{ label: string; value: number; color: string }>;
  height?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((a, b) => a + b.value, 0);
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <div className="relative shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius="68%" outerRadius="92%" paddingAngle={2} stroke="var(--lp-surface)" strokeWidth={2} animationDuration={600}>
              {data.map((d) => (
                <Cell key={d.label} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip formatter={(v) => `${v} (${Math.round((v / total) * 100)}%)`} />} />
          </PieChart>
        </ResponsiveContainer>
        {centerValue ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold text-foreground">{centerValue}</span>
            {centerLabel ? <span className="text-[11px] text-muted">{centerLabel}</span> : null}
          </div>
        ) : null}
      </div>
      <ul className="min-w-0 flex-1 basis-[140px] space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="size-2.5 rounded-sm" style={{ background: d.color }} />
            <span className="text-foreground-secondary">{d.label}</span>
            <span className="ml-auto pl-4 font-medium tabular-nums text-foreground">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Revenue funnel */
export function FunnelChart({ stages, className }: { stages: Array<{ key: string; label: string; value: number }>; className?: string }) {
  const max = stages[0]?.value || 1;
  return (
    <div className={cn("space-y-1.5", className)}>
      {stages.map((s, i) => {
        const pct = (s.value / max) * 100;
        const prev = stages[i - 1];
        const conv = prev ? (s.value / prev.value) * 100 : 100;
        return (
          <div key={s.key} className="group grid grid-cols-[110px_1fr_88px] items-center gap-3 sm:grid-cols-[140px_1fr_110px]">
            <span className="truncate text-[13px] text-foreground-secondary group-hover:text-foreground">{s.label}</span>
            <div className="relative h-8 w-full">
              <div
                className="absolute inset-y-0 left-1/2 -translate-x-1/2 rounded-md transition-all duration-700"
                style={{
                  width: `${Math.max(pct, 6)}%`,
                  background: `linear-gradient(90deg, color-mix(in oklab, var(--lp-chart-1) ${100 - i * 12}%, var(--lp-chart-2)), color-mix(in oklab, var(--lp-chart-2) ${100 - i * 8}%, var(--lp-chart-1)))`,
                  opacity: 0.95 - i * 0.08,
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white tabular-nums drop-shadow">{formatNumber(s.value)}</span>
            </div>
            <span className="text-right text-xs tabular-nums text-muted">
              {i === 0 ? "100%" : <><span className="text-foreground">{conv.toFixed(1)}%</span> of prev</>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* Mini sparkline bars used inline in tables */
export function MiniBars({ values, color = SERIES[1], height = 22 }: { values: number[]; color?: string; height?: number }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-[2px]" style={{ height }}>
      {values.map((v, i) => (
        <span key={i} className="w-[3px] rounded-[1px]" style={{ height: `${Math.max((v / max) * 100, 8)}%`, background: color, opacity: 0.85 }} />
      ))}
    </div>
  );
}
