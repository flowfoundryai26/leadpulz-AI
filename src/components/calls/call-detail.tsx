"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Bot, Calendar, Flame, Gauge, MessageSquareWarning, PhoneCall, ShieldAlert, Sparkles, Swords, Target, UserSquare2, ListTree } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, Progress } from "@/components/ui/primitives";
import { ErrorState, PageSkeleton } from "@/components/ui/states";
import { DirectionBadge, LeadQualityBadge, OutcomeBadge, ScorePill, SentimentBadge } from "@/components/ui/domain-badges";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioPlayer } from "./audio-player";
import { HighlightLegend, Transcript } from "./transcript";
import { formatDateTime, formatDuration, formatTime } from "@/lib/format";
import { MakeCallDialog } from "./make-call-dialog";
import { cn } from "@/lib/utils";

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <div className="mt-0.5 text-sm font-medium text-foreground">{children}</div>
    </div>
  );
}

export function CallDetail({ callId }: { callId: string }) {
  const router = useRouter();
  const { data: call, loading, error, refetch } = useQuery(() => services.calls.get(callId), [callId]);
  const [time, setTime] = useState(0);
  const [callOpen, setCallOpen] = useState(false);

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (loading) return <PageSkeleton />;
  if (!call) return <ErrorState error={{ name: "ServiceError", message: "This call could not be found.", code: "not_found" } as never} onRetry={() => router.push("/calls")} />;

  const seedNum = call.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Calls", href: "/calls" }, { label: call.customerName }]}
        title={
          <span className="flex items-center gap-3">
            <Avatar name={call.customerName} size="lg" />
            <span>
              {call.customerName}
              <span className="ml-3 align-middle"><OutcomeBadge outcome={call.outcome} status={call.status} /></span>
            </span>
          </span>
        }
        description={<span suppressHydrationWarning>{formatDateTime(call.startedAt)} · {call.intent}</span>}
        actions={
          <>
            {call.leadId ? (
              <Button asChild variant="secondary">
                <Link href={`/leads/${call.leadId}`}>
                  <UserSquare2 /> Open lead
                </Link>
              </Button>
            ) : null}
            <Button onClick={() => setCallOpen(true)}>
              <PhoneCall /> Call back
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardContent className="grid gap-x-6 gap-y-4 p-5 sm:grid-cols-3 lg:grid-cols-5">
              <Meta label="Customer"><span className="font-mono text-xs">{call.customerPhone}</span></Meta>
              <Meta label="AI agent"><span className="flex items-center gap-1.5"><Bot className="size-3.5 text-[#a3a3ff]" />{call.agentName.split(" — ")[0]}</span></Meta>
              <Meta label="Phone number"><span className="font-mono text-xs">{call.phoneNumber}</span></Meta>
              <Meta label="Duration"><span className="font-mono">{formatDuration(call.durationSec)}</span></Meta>
              <Meta label="Direction"><DirectionBadge direction={call.direction} /></Meta>
              <Meta label="Call status"><span className="capitalize">{call.status.replace("_", " ")}</span></Meta>
              <Meta label="Objective">{call.objective}</Meta>
              <Meta label="Lead score"><ScorePill score={call.leadScore} /></Meta>
              <Meta label="Sentiment"><SentimentBadge sentiment={call.sentiment} /></Meta>
              <Meta label="Appointment">
                {call.appointmentStatus === "booked" ? <Badge variant="success" dot>Booked</Badge> : call.appointmentStatus === "pending" ? <Badge variant="warning" dot>Pending</Badge> : <span className="text-muted">None</span>}
              </Meta>
            </CardContent>
          </Card>

          {/* Recording */}
          <section id="recording">
            <h2 className="mb-3 text-[15px] font-semibold">Call recording</h2>
            {call.durationSec > 0 ? <AudioPlayer src={call.recordingUrl} durationSec={call.durationSec} seed={seedNum} onTimeChange={setTime} /> : <Card className="p-6 text-sm text-muted">No recording — the call was not answered.</Card>}
          </section>

          {/* Transcript / events */}
          <Card>
            <Tabs defaultValue="transcript">
              <CardHeader className="flex-row items-center justify-between">
                <TabsList>
                  <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  <TabsTrigger value="events">Call events</TabsTrigger>
                </TabsList>
                <HighlightLegend />
              </CardHeader>
              <CardContent>
                <TabsContent value="transcript" className="mt-0">
                  <Transcript turns={call.transcript ?? []} agentName={call.agentName.split(" — ")[0].split(" ")[0]} currentTime={time} />
                </TabsContent>
                <TabsContent value="events" className="mt-0">
                  <ol className="relative ml-2 space-y-4 border-l border-border pl-5">
                    {(call.events ?? []).map((e) => (
                      <li key={e.id} className="relative">
                        <span className="absolute -left-[26px] top-1 size-2.5 rounded-full border-2 border-surface bg-primary" />
                        <p className="text-sm font-medium">{e.description}</p>
                        <p className="text-xs text-muted" suppressHydrationWarning><span className="font-mono">{e.type}</span> · {formatTime(e.at)}</p>
                      </li>
                    ))}
                    {!call.events?.length ? <li className="text-sm text-muted">No events recorded for this call.</li> : null}
                  </ol>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Right rail — AI summary + insights */}
        <div className="space-y-6">
          <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/15 blur-3xl" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="size-4 text-[#a3a3ff]" /> AI Call Summary</CardTitle>
              <CardDescription>Generated automatically after the call.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {call.summary ? (
                <>
                  <p className="leading-relaxed text-foreground-secondary">{call.summary.summary}</p>
                  <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface-2/40 p-3">
                    <div>
                      <p className="text-[11px] text-muted">Lead quality</p>
                      <p className="mt-1 text-base font-bold uppercase tracking-wide text-foreground">{call.summary.leadQuality === "hot" ? "High intent" : call.summary.leadQuality === "warm" ? "Medium intent" : call.summary.leadQuality === "cold" ? "Low intent" : "Not qualified"}</p>
                      <LeadQualityBadge quality={call.summary.leadQuality} />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted">Recommended action</p>
                      <p className="mt-1 font-semibold leading-snug text-foreground">{call.summary.nextAction}</p>
                    </div>
                  </div>
                  <SummaryRow label="Customer intent" value={call.summary.intent} />
                  <SummaryRow label="Pain points" value={call.summary.painPoints} />
                  <SummaryRow label="Requirements" value={call.summary.requirements} />
                  <div className="grid grid-cols-2 gap-3">
                    <SummaryRow label="Budget" value={call.summary.budget ?? "Not discussed"} />
                    <SummaryRow label="Timeline" value={call.summary.timeline ?? "Not discussed"} />
                  </div>
                  {call.summary.appointment ? <SummaryRow label="Appointment" value={<span className="flex items-center gap-1.5"><Calendar className="size-3.5 text-success" />{call.summary.appointment}</span>} /> : null}
                </>
              ) : (
                <p className="text-muted">No summary — the call was too short or not answered.</p>
              )}
            </CardContent>
          </Card>

          {call.insights ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Gauge className="size-4 text-accent" /> AI Insights</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <InsightCard icon={<Target />} label="Customer intent" value={call.insights.intent} />
                <InsightCard icon={<Flame />} label="Buying probability" value={`${call.insights.buyingProbability}%`} extra={<Progress value={call.insights.buyingProbability} tone={call.insights.buyingProbability > 70 ? "success" : call.insights.buyingProbability > 40 ? "warning" : "danger"} className="mt-2" />} />
                <InsightCard icon={<Sparkles />} label="Sentiment" value={<SentimentBadge sentiment={call.insights.sentiment} />} />
                <InsightCard icon={<ShieldAlert />} label="Urgency" value={<Badge variant={call.insights.urgency === "high" ? "danger" : call.insights.urgency === "medium" ? "warning" : "muted"} className="capitalize">{call.insights.urgency}</Badge>} />
                <InsightCard icon={<MessageSquareWarning />} label="Objections" value={call.insights.objections.length ? call.insights.objections.join(", ") : "None detected"} />
                <InsightCard icon={<Swords />} label="Competitor mentions" value={call.insights.competitorMentions.length ? call.insights.competitorMentions.join(", ") : "None"} />
                <div className="col-span-2 rounded-xl border border-primary/30 bg-primary-soft p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#c7c7ff]"><ListTree className="size-3.5" /> Suggested next action</p>
                  <p className="mt-1 text-sm text-foreground">{call.insights.suggestedNextAction}</p>
                  {call.leadId ? (
                    <Button asChild size="sm" variant="secondary" className="mt-3">
                      <Link href={`/leads/${call.leadId}`}>Go to lead <ArrowRight /></Link>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
      <MakeCallDialog open={callOpen} onOpenChange={setCallOpen} defaultPhone={call.customerPhone} defaultName={call.customerName} />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode | string[] }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
      {Array.isArray(value) ? (
        <ul className="mt-1 space-y-0.5">
          {value.map((v) => <li key={v} className="flex gap-2 text-foreground-secondary"><span className="text-faint">•</span>{v}</li>)}
        </ul>
      ) : (
        <div className="mt-0.5 text-foreground-secondary">{value}</div>
      )}
    </div>
  );
}

function InsightCard({ icon, label, value, extra, className }: { icon: React.ReactNode; label: string; value: React.ReactNode; extra?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface-2/40 p-3", className)}>
      <p className="flex items-center gap-1.5 text-[11px] text-muted [&_svg]:size-3.5">{icon}{label}</p>
      <div className="mt-1.5 text-sm font-medium text-foreground">{value}</div>
      {extra}
    </div>
  );
}
