"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bot, PhoneCall, PhoneIncoming, Sparkles, Filter, Calendar, Percent, Clock, IndianRupee, ArrowRight, Plus } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard, StatCardSkeleton } from "@/components/ui/stat-card";
import { ErrorState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/primitives";
import { AreaSeriesChart, FunnelChart, SERIES } from "@/components/charts";
import { DateRangeSelector } from "@/components/dashboard/date-range";
import { LiveAgentActivity } from "@/components/dashboard/live-activity";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { UsageMeter } from "@/components/dashboard/usage-meter";
import { WelcomeHero } from "@/components/dashboard/welcome-hero";
import { OutcomeBadge } from "@/components/ui/domain-badges";
import { formatDuration, formatTime } from "@/lib/format";
import { Avatar } from "@/components/ui/primitives";

const kpiIcons: Record<string, React.ReactNode> = {
  total_calls: <PhoneCall />,
  answered_calls: <PhoneIncoming />,
  leads: <Sparkles />,
  qualified: <Filter />,
  appointments: <Calendar />,
  conversion: <Percent />,
  avg_duration: <Clock />,
  revenue: <IndianRupee />,
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const range = useAppStore((s) => s.dateRange);
  const { data: user } = useQuery(() => services.auth.getCurrentUser(), []);
  const kpis = useQuery(() => services.analytics.getKpis(range), [range]);
  const series = useQuery(() => services.analytics.getCallSeries(range), [range]);
  const funnel = useQuery(() => services.analytics.getFunnel(range), [range]);
  const recentCalls = useQuery(() => services.calls.list({ pageSize: 6 }), []);
  const upcoming = useQuery(() => services.appointments.list(), []);

  const sparklines = useMemo(() => {
    if (!series.data) return {};
    return {
      total_calls: series.data.map((p) => p.inbound + p.outbound),
      answered_calls: series.data.map((p) => Math.round((p.inbound + p.outbound) * 0.93)),
      leads: series.data.map((p) => Math.round((p.inbound + p.outbound) * 0.48)),
      qualified: series.data.map((p) => p.qualified),
      appointments: series.data.map((p) => p.bookings),
      conversion: series.data.map((p) => (p.qualified / Math.max(p.inbound + p.outbound, 1)) * 100),
      avg_duration: series.data.map((p) => 200 + (p.qualified % 30)),
      revenue: series.data.map((p) => p.bookings * 5600),
    } as Record<string, number[]>;
  }, [series.data]);

  const [now] = useState(() => Date.now());
  const nextAppointments = useMemo(() => (upcoming.data ?? []).filter((a) => new Date(a.startsAt).getTime() > now && a.status !== "cancelled").slice(0, 5), [upcoming.data, now]);

  return (
    <div className="space-y-8">
      <WelcomeHero />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
            {greeting()}, {user?.fullName?.split(" ")[0] ?? "there"}
          </h1>
          <p className="mt-1 text-sm text-muted">Here&apos;s what your AI agents are doing today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangeSelector />
          <Button asChild>
            <Link href="/agents/new">
              <Plus /> Create Agent
            </Link>
          </Button>
        </div>
      </div>

      {kpis.error ? (
        <ErrorState error={kpis.error} onRetry={kpis.refetch} compact />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {kpis.loading || !kpis.data
            ? Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)
            : kpis.data.map((k) => <KpiCard key={k.key} kpi={k} icon={kpiIcons[k.key]} sparkline={sparklines[k.key]} />)}
        </div>
      )}

      <LiveAgentActivity />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Call Volume</CardTitle>
              <CardDescription>Incoming, outgoing, qualified leads and bookings over time.</CardDescription>
            </div>
            <DateRangeSelector className="hidden md:inline-flex" />
          </CardHeader>
          <CardContent>
            {series.loading || !series.data ? (
              <Skeleton className="h-[280px]" />
            ) : (
              <AreaSeriesChart
                data={series.data}
                xKey="label"
                series={[
                  { key: "inbound", label: "Incoming calls", color: SERIES[1] },
                  { key: "outbound", label: "Outgoing calls", color: SERIES[2] },
                  { key: "qualified", label: "Qualified leads", color: SERIES[3] },
                  { key: "bookings", label: "Bookings", color: SERIES[4] },
                ]}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Pipeline</CardTitle>
            <CardDescription>From first ring to paying customer.</CardDescription>
          </CardHeader>
          <CardContent>
            {funnel.loading || !funnel.data ? <Skeleton className="h-[260px]" /> : <FunnelChart stages={funnel.data} />}
            {funnel.data ? (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-surface-2/50 px-4 py-3 text-sm">
                <span className="text-muted">Call → Customer</span>
                <span className="font-semibold text-foreground">{((funnel.data[funnel.data.length - 1].value / funnel.data[0].value) * 100).toFixed(1)}%</span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <InsightsPanel />

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Recent Calls</CardTitle>
              <CardDescription>Latest conversations handled by your agents.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="xs">
              <Link href="/calls">
                View all <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-2">
            {recentCalls.loading ? (
              <div className="space-y-2 px-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : (
              <ul>
                {recentCalls.data?.items.map((c) => (
                  <li key={c.id}>
                    <Link href={`/calls/${c.id}`} className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface-2">
                      <Avatar name={c.customerName} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{c.customerName}</span>
                        <span className="block truncate text-xs text-muted">{c.intent}</span>
                      </span>
                      <span className="flex flex-col items-end gap-1">
                        <OutcomeBadge outcome={c.outcome} />
                        <span className="text-[11px] tabular-nums text-muted">{formatDuration(c.durationSec)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <UsageMeter />
          <Card>
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Booked by your AI agents.</CardDescription>
              </div>
              <Button asChild variant="ghost" size="xs">
                <Link href="/appointments">
                  Calendar <ArrowRight />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="px-2">
              {upcoming.loading ? (
                <div className="space-y-2 px-3">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-11" />
                  ))}
                </div>
              ) : (
                <ul>
                  {nextAppointments.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-2">
                      <span className="flex size-9 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-surface-2 text-[10px] leading-tight">
                        <span className="font-semibold text-foreground">{new Date(a.startsAt).getDate()}</span>
                        <span className="uppercase text-muted">{new Date(a.startsAt).toLocaleString("en", { month: "short" })}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{a.customerName}</span>
                        <span className="block truncate text-xs text-muted">
                          {a.service} · {a.staff}
                        </span>
                      </span>
                      <span className="text-xs tabular-nums text-muted">{formatTime(a.startsAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-[#a3a3ff]">
            <Bot className="size-5" />
          </span>
          <div>
            <p className="font-semibold">Ready to handle more conversations?</p>
            <p className="text-sm text-muted">Deploy an outbound follow-up agent to recover the 18 qualified leads who haven&apos;t booked yet.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/leads?stage=qualified">View leads</Link>
          </Button>
          <Button asChild>
            <Link href="/campaigns/new">Start campaign</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
