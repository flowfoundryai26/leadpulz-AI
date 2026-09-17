"use client";

import Link from "next/link";
import { ArrowRight, Lightbulb, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import type { Insight } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const kindMeta: Record<Insight["kind"], { icon: React.ReactNode; tone: string }> = {
  opportunity: { icon: <Sparkles />, tone: "text-[#a3a3ff] bg-primary-soft" },
  warning: { icon: <AlertTriangle />, tone: "text-warning bg-warning-soft" },
  trend: { icon: <TrendingUp />, tone: "text-accent bg-accent-soft" },
  recommendation: { icon: <Lightbulb />, tone: "text-success bg-success-soft" },
};

export function InsightsPanel({ className, limit }: { className?: string; limit?: number }) {
  const { data, loading } = useQuery(() => services.analytics.getInsights(), []);
  const items = limit ? data?.slice(0, limit) : data;
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/15 blur-3xl" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-[#a3a3ff]" /> LeadPulz AI Insights
        </CardTitle>
        <CardDescription>What your conversations are telling you this week.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : (
          <ul className="space-y-2.5">
            {items?.map((ins) => {
              const m = kindMeta[ins.kind];
              return (
                <li key={ins.id} className="flex items-start gap-3 rounded-xl border border-border bg-surface-2/40 p-3 transition-colors hover:border-border-strong">
                  <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg [&_svg]:size-3.5", m.tone)}>{m.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-snug text-foreground">{ins.text}</p>
                    {ins.actionLabel && ins.actionHref ? (
                      <Link href={ins.actionHref} className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#a3a3ff] hover:underline">
                        {ins.actionLabel} <ArrowRight className="size-3" />
                      </Link>
                    ) : null}
                  </div>
                  {ins.metric ? <span className="shrink-0 rounded-md bg-elevated px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground">{ins.metric}</span> : null}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
