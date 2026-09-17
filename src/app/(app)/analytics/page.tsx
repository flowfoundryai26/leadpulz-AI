"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Bot } from "lucide-react";
import { toast } from "sonner";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import { useAppStore } from "@/store/app-store";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard, StatCard, StatCardSkeleton } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Skeleton, Progress } from "@/components/ui/primitives";
import { DateRangeSelector } from "@/components/dashboard/date-range";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { AreaSeriesChart, BarList, BarSeriesChart, DonutChart, SERIES } from "@/components/charts";
import type { AgentPerformance } from "@/types";
import { formatCurrency, formatDuration, formatNumber, formatPercent } from "@/lib/format";

function AnalyticsContent() {
  const params = useSearchParams();
  const range = useAppStore((s) => s.dateRange);
  const kpis = useQuery(() => services.analytics.getKpis(range), [range]);
  const series = useQuery(() => services.analytics.getCallSeries(range), [range]);
  const board = useQuery(() => services.analytics.getAgentLeaderboard(range), [range]);
  const intel = useQuery(() => services.analytics.getConversationIntelligence(range), [range]);
  const costs = useQuery(() => services.analytics.getCostMetrics(range), [range]);
  const campaigns = useQuery(() => services.campaigns.list(), []);
  const initialTab = params.get("tab") ?? "overview";

  const columns = useMemo<Column<AgentPerformance>[]>(() => [
    { key: "agent", header: "Agent", sortValue: (a) => a.agentName, cell: (a) => <span className="flex items-center gap-2 font-medium"><span className="flex size-7 items-center justify-center rounded-lg bg-primary-soft text-[#a3a3ff]"><Bot className="size-3.5" /></span>{a.agentName}</span> },
    { key: "calls", header: "Calls", sortValue: (a) => a.calls, cell: (a) => <span className="tabular-nums">{formatNumber(a.calls)}</span> },
    { key: "q", header: "Qualified leads", sortValue: (a) => a.qualifiedLeads, cell: (a) => <span className="tabular-nums">{formatNumber(a.qualifiedLeads)}</span> },
    { key: "appt", header: "Appointments", sortValue: (a) => a.appointments, cell: (a) => <span className="tabular-nums">{formatNumber(a.appointments)}</span> },
    { key: "conv", header: "Conversion rate", sortValue: (a) => a.conversionRate, cell: (a) => <span className="flex items-center gap-2"><span className="w-12 tabular-nums">{formatPercent(a.conversionRate)}</span><Progress value={a.conversionRate * 2.5} className="w-20" /></span> },
    { key: "dur", header: "Avg. duration", sortValue: (a) => a.avgDurationSec, cell: (a) => <span className="font-mono text-xs">{formatDuration(a.avgDurationSec)}</span> },
    { key: "res", header: "AI resolution", sortValue: (a) => a.resolutionRate, cell: (a) => <span className="tabular-nums">{formatPercent(a.resolutionRate)}</span> },
    { key: "rev", header: "Revenue", sortValue: (a) => a.revenue, cell: (a) => <span className="font-medium tabular-nums">{formatCurrency(a.revenue)}</span> },
  ], []);

  const campaignRows = (campaigns.data ?? []).filter((c) => c.stats.attempted > 0).map((c) => ({ label: c.name.length > 28 ? c.name.slice(0, 28) + "…" : c.name, attempted: c.stats.attempted, answered: c.stats.answered, appointments: c.stats.appointments }));

  return (
    <div>
      <PageHeader title="Analytics" description="Operational performance across calls, leads, agents and campaigns." actions={<><DateRangeSelector /><Button variant="secondary" onClick={() => toast.success("Report export started", { description: "You'll receive a CSV by email in a few minutes." })}><Download /> Export</Button></>} />

      <Tabs defaultValue={initialTab}>
        <TabsList variant="underline" className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="intelligence">Conversation Intelligence</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {kpis.loading || !kpis.data ? Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />) : kpis.data.map((k) => <KpiCard key={k.key} kpi={k} />)}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {costs.loading || !costs.data ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />) : (
              <>
                <StatCard label="Answered rate" value={formatPercent(costs.data.answeredRate)} delta={1.8} />
                <StatCard label="AI resolution rate" value={formatPercent(costs.data.aiResolutionRate)} delta={2.4} hint="Resolved without human handoff" />
                <StatCard label="Cost per lead" value={formatCurrency(costs.data.costPerLead)} delta={-6.1} invertDelta />
                <StatCard label="Cost per appointment" value={formatCurrency(costs.data.costPerAppointment)} delta={-4.3} invertDelta />
              </>
            )}
          </div>
          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader><CardTitle>Calls, leads & bookings</CardTitle><CardDescription>Trend over the selected period.</CardDescription></CardHeader>
              <CardContent>{series.loading || !series.data ? <Skeleton className="h-[280px]" /> : <AreaSeriesChart data={series.data} xKey="label" series={[{ key: "inbound", label: "Incoming", color: SERIES[1] }, { key: "outbound", label: "Outgoing", color: SERIES[2] }, { key: "qualified", label: "Qualified", color: SERIES[3] }, { key: "bookings", label: "Bookings", color: SERIES[4] }]} />}</CardContent>
            </Card>
            <InsightsPanel />
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Agent leaderboard</CardTitle><CardDescription>Compare operational performance across agents. Sort any column.</CardDescription></CardHeader>
            <CardContent className="p-0"><DataTable className="rounded-none border-0 shadow-none" columns={columns} rows={board.data} rowKey={(a) => a.agentId} loading={board.loading} /></CardContent>
          </Card>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card><CardHeader><CardTitle>Revenue by agent</CardTitle></CardHeader><CardContent>{board.data ? <BarList items={board.data.map((a) => ({ label: a.agentName, count: a.revenue }))} formatter={(v) => formatCurrency(v)} /> : <Skeleton className="h-40" />}</CardContent></Card>
            <Card><CardHeader><CardTitle>Appointments by agent</CardTitle></CardHeader><CardContent>{board.data ? <BarSeriesChart data={board.data.map((a) => ({ label: a.agentName.split(" — ")[0], appointments: a.appointments, qualified: a.qualifiedLeads }))} xKey="label" series={[{ key: "qualified", label: "Qualified", color: SERIES[1] }, { key: "appointments", label: "Appointments", color: SERIES[2] }]} /> : <Skeleton className="h-40" />}</CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Campaign performance</CardTitle><CardDescription>Attempted vs answered vs booked per campaign.</CardDescription></CardHeader>
            <CardContent>{campaigns.loading ? <Skeleton className="h-64" /> : <BarSeriesChart height={300} data={campaignRows} xKey="label" series={[{ key: "attempted", label: "Attempted", color: SERIES[1] }, { key: "answered", label: "Answered", color: SERIES[2] }, { key: "appointments", label: "Appointments", color: SERIES[3] }]} />}</CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {(campaigns.data ?? []).filter((c) => c.stats.attempted).map((c) => <StatCard key={c.id} label={c.name} value={formatPercent(c.stats.answered ? (c.stats.appointments / c.stats.answered) * 100 : 0)} hint={`${formatNumber(c.stats.appointments)} appointments from ${formatNumber(c.stats.answered)} answered`} />)}
          </div>
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-6">
          {intel.loading || !intel.data ? <Skeleton className="h-96" /> : (
            <>
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2"><CardHeader><CardTitle>Most common questions</CardTitle><CardDescription>What customers ask most, with week-over-week change.</CardDescription></CardHeader><CardContent><BarList items={intel.data.commonQuestions} showDelta /></CardContent></Card>
                <Card><CardHeader><CardTitle>Customer sentiment</CardTitle></CardHeader><CardContent><DonutChart height={170} centerValue={`${intel.data.sentiment.positive}%`} centerLabel="positive" data={[{ label: "Positive", value: intel.data.sentiment.positive, color: "var(--lp-success)" }, { label: "Neutral", value: intel.data.sentiment.neutral, color: "var(--lp-muted)" }, { label: "Negative", value: intel.data.sentiment.negative, color: "var(--lp-danger)" }]} /></CardContent></Card>
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <Card><CardHeader><CardTitle>Customer intents</CardTitle></CardHeader><CardContent><BarList items={intel.data.intents} color={SERIES[2]} /></CardContent></Card>
                <Card><CardHeader><CardTitle>Customer objections</CardTitle></CardHeader><CardContent><BarList items={intel.data.objections} color={SERIES[3]} showDelta /></CardContent></Card>
                <Card><CardHeader><CardTitle>Service demand</CardTitle></CardHeader><CardContent><BarList items={intel.data.serviceDemand} color={SERIES[4]} showDelta /></CardContent></Card>
                <Card><CardHeader><CardTitle>Reasons for lost leads</CardTitle></CardHeader><CardContent><BarList items={intel.data.lostReasons} color="var(--lp-danger)" /></CardContent></Card>
                <Card><CardHeader><CardTitle>Reasons for booking</CardTitle></CardHeader><CardContent><BarList items={intel.data.bookingReasons} color="var(--lp-success)" /></CardContent></Card>
                <Card><CardHeader><CardTitle>Call topics</CardTitle></CardHeader><CardContent><BarList items={intel.data.topics} color={SERIES[1]} /></CardContent></Card>
              </div>
              <Card>
                <CardHeader><CardTitle>Keyword trends</CardTitle><CardDescription>Mentions across transcripts, with change vs previous period.</CardDescription></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {intel.data.keywordTrends.map((k) => (
                    <span key={k.label} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2/60 px-3 py-1.5 text-sm"><span className="font-medium">{k.label}</span><span className="text-xs text-muted">{k.count}</span>{k.delta !== undefined ? <span className={"text-xs " + (k.delta > 0 ? "text-success" : "text-danger")}>{k.delta > 0 ? "+" : ""}{k.delta}%</span> : null}</span>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AnalyticsPage() {
  return <Suspense><AnalyticsContent /></Suspense>;
}
