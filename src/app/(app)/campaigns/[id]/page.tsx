"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bot, Clock, Pause, Play, Users, Repeat, Target } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { ErrorState, PageSkeleton } from "@/components/ui/states";
import { CampaignStatusBadge } from "@/components/ui/domain-badges";
import { BarSeriesChart, FunnelChart, DonutChart, SERIES } from "@/components/charts";
import { CallsTable } from "@/components/calls/calls-table";
import { CAMPAIGN_TYPE_LABEL } from "@/lib/constants";
import { formatDate, formatNumber, formatPercent } from "@/lib/format";
import { Suspense } from "react";

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: c, loading, error, refetch } = useQuery(() => services.campaigns.get(id), [id]);

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (loading) return <PageSkeleton />;
  if (!c) return <ErrorState error={{ name: "ServiceError", message: "Campaign not found.", code: "not_found" } as never} onRetry={() => router.push("/campaigns")} />;

  const s = c.stats;
  const convRate = s.answered ? (s.appointments / s.answered) * 100 : 0;
  const toggle = async () => {
    const next = c.status === "running" ? "paused" : "running";
    await services.campaigns.setStatus(c.id, next);
    toast.success(next === "running" ? "Campaign running" : "Campaign paused");
    refetch();
  };

  const daily = Array.from({ length: 7 }).map((_, i) => ({ label: `Day ${i + 1}`, attempted: Math.round(s.attempted / 7 * (0.7 + (i % 3) * 0.2)), answered: Math.round(s.answered / 7 * (0.7 + (i % 3) * 0.2)), booked: Math.round(s.appointments / 7 * (0.6 + (i % 4) * 0.2)) }));

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Campaigns", href: "/campaigns" }, { label: c.name }]}
        title={<span className="flex items-center gap-3">{c.name}<CampaignStatusBadge status={c.status} /></span>}
        description={<span className="flex flex-wrap items-center gap-x-4 gap-y-1"><span>{CAMPAIGN_TYPE_LABEL[c.type]}</span><span className="flex items-center gap-1"><Bot className="size-3.5" />{c.agentName}</span><span className="flex items-center gap-1"><Users className="size-3.5" />{c.contactListName} · {formatNumber(c.totalContacts)} contacts</span><span className="flex items-center gap-1"><Clock className="size-3.5" />{c.callingHours.start}–{c.callingHours.end} {c.timezone}</span><span className="flex items-center gap-1"><Repeat className="size-3.5" />{c.maxAttempts} attempts</span></span>}
        actions={c.status !== "completed" && c.status !== "draft" ? <Button onClick={toggle}>{c.status === "running" ? <><Pause /> Pause campaign</> : <><Play /> Resume campaign</>}</Button> : c.status === "draft" ? <Button onClick={toggle}><Play /> Launch campaign</Button> : null}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Calls attempted" value={formatNumber(s.attempted)} hint={`${formatPercent((s.attempted / Math.max(c.totalContacts, 1)) * 100, 0)} of list`} />
        <StatCard label="Answered" value={formatNumber(s.answered)} hint={`${formatPercent((s.answered / Math.max(s.attempted, 1)) * 100, 0)} answer rate`} />
        <StatCard label="Interested" value={formatNumber(s.interested)} />
        <StatCard label="Qualified" value={formatNumber(s.qualified)} />
        <StatCard label="Appointments" value={formatNumber(s.appointments)} hint={`${formatPercent(convRate)} conversion`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Daily progress</CardTitle><CardDescription>Attempted, answered and booked per day.</CardDescription></CardHeader>
          <CardContent><BarSeriesChart data={daily} xKey="label" series={[{ key: "attempted", label: "Attempted", color: SERIES[1] }, { key: "answered", label: "Answered", color: SERIES[2] }, { key: "booked", label: "Booked", color: SERIES[3] }]} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Outcomes</CardTitle></CardHeader>
          <CardContent>
            <DonutChart height={160} centerValue={formatNumber(s.attempted)} centerLabel="attempts" data={[{ label: "Answered", value: s.answered, color: SERIES[1] }, { label: "No answer", value: s.noAnswer, color: SERIES[2] }, { label: "Voicemail", value: s.voicemail, color: SERIES[3] }, { label: "Do-not-call", value: s.doNotCall, color: SERIES[4] }]} />
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Campaign funnel</CardTitle></CardHeader>
          <CardContent><FunnelChart stages={[{ key: "a", label: "Attempted", value: s.attempted }, { key: "b", label: "Answered", value: s.answered }, { key: "c", label: "Interested", value: s.interested }, { key: "d", label: "Qualified", value: s.qualified }, { key: "e", label: "Appointments", value: s.appointments }, { key: "f", label: "Conversions", value: s.conversions }]} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Target className="size-4 text-muted" /> Objective</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground-secondary">
            <p>{c.objective}</p>
            {c.script ? <div><p className="text-[11px] uppercase tracking-wider text-muted">Script guidance</p><p className="mt-1">{c.script}</p></div> : null}
            <p className="text-xs text-muted" suppressHydrationWarning>Runs {formatDate(c.startDate)}{c.endDate ? ` → ${formatDate(c.endDate)}` : " until list completes"}</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 text-[15px] font-semibold">Campaign calls</h2>
      <Suspense><CallsTable compact /></Suspense>
    </div>
  );
}
