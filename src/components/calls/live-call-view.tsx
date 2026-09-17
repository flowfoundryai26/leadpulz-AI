"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Bot, Ear, Hand, PhoneForwarded, PhoneOff, Radio, StickyNote } from "lucide-react";
import type { LiveCall } from "@/types";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/primitives";
import { ErrorState, PageSkeleton, EmptyState } from "@/components/ui/states";
import { SentimentBadge } from "@/components/ui/domain-badges";
import { Transcript } from "./transcript";
import { LiveCallCard, Waveform } from "@/components/dashboard/live-activity";
import { formatDuration } from "@/lib/format";
import { Textarea } from "@/components/ui/input";

export function LiveCallsPage() {
  const { data, loading, error, refetch } = useQuery(() => services.calls.getLive(), []);
  return (
    <div>
      <PageHeader title={<span className="flex items-center gap-2"><Radio className="size-5 text-accent" /> Live Calls</span>} description="Monitor conversations as they happen. Listen in, whisper to the agent, or take over." />
      {error ? <ErrorState error={error} onRetry={refetch} /> : loading ? <PageSkeleton rows={1} /> : data?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.map((c) => <LiveCallCard key={c.id} call={c} />)}</div>
      ) : (
        <EmptyState icon={<Radio />} title="No live calls" description="Active conversations appear here in real time via WebSockets." />
      )}
    </div>
  );
}

export function LiveCallDetail({ callId }: { callId: string }) {
  const router = useRouter();
  const [call, setCall] = useState<LiveCall | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [notes, setNotes] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unsub = () => {};
    services.calls.getLiveCall(callId).then((c) => {
      setCall(c);
      setLoading(false);
      if (c) {
        setElapsed(c.durationSec);
        unsub = services.calls.subscribeLive(callId, (u) => {
          setCall(u);
          setElapsed(u.durationSec);
        });
      }
    });
    return () => unsub();
  }, [callId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [call?.transcript.length]);

  if (loading) return <PageSkeleton />;
  if (!call) return <ErrorState error={{ name: "ServiceError", message: "This call has ended or does not exist.", code: "not_found" } as never} onRetry={() => router.push("/calls/live")} />;

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Calls", href: "/calls" }, { label: "Live", href: "/calls/live" }, { label: call.customerName }]}
        title={
          <span className="flex items-center gap-3">
            <Avatar name={call.customerName} size="lg" />
            {call.customerName}
            <Badge variant="accent" dot pulse>LIVE · {formatDuration(elapsed)}</Badge>
          </span>
        }
        description={<span className="font-mono text-xs">{call.customerPhone}</span>}
        actions={
          <>
            <Button variant="secondary" onClick={() => toast.info("Listening in (muted)")}><Ear /> Listen</Button>
            <Button variant="secondary" onClick={() => toast.info("Whisper mode — only the agent hears you")}><Hand /> Whisper</Button>
            <Button variant="secondary" onClick={() => toast.success("Transferring to +91 40 4567 8900")}><PhoneForwarded /> Transfer</Button>
            <Button variant="danger" onClick={() => { toast.success("Call ended"); router.push("/calls"); }}><PhoneOff /> End call</Button>
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="flex max-h-[70dvh] min-h-[420px] flex-col sm:min-h-[520px]">
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 border-b border-border">
            <CardTitle className="flex items-center gap-2"><Bot className="size-4 text-[#a3a3ff]" /> {call.agentName}</CardTitle>
            <Waveform />
          </CardHeader>
          <CardContent ref={scrollRef} className="flex-1 overflow-y-auto pt-4">
            <Transcript turns={call.transcript} agentName={call.agentName.split(" ")[0]} live />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card className="p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted">Stage</p>
            <Badge variant="accent" dot pulse className="mt-1">{call.stage}</Badge>
            <div className="mt-4 space-y-3 text-sm">
              <div><p className="text-[11px] text-muted">Detected intent</p><p className="font-medium">{call.intent}</p></div>
              <div><p className="text-[11px] text-muted">Sentiment</p><div className="mt-0.5"><SentimentBadge sentiment={call.sentiment} /></div></div>
              <div><p className="text-[11px] text-muted">Turns</p><p className="font-medium tabular-nums">{call.transcript.length}</p></div>
            </div>
          </Card>
          <Card className="p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold"><StickyNote className="size-4 text-muted" /> Live notes</p>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes are attached to the lead when the call ends…" className="mt-3 min-h-[120px]" />
            <Button size="sm" variant="secondary" className="mt-2 w-full" onClick={() => toast.success("Note saved to lead")}>Save note</Button>
          </Card>
          <Button asChild variant="ghost" className="w-full"><Link href="/calls/live">← All live calls</Link></Button>
        </div>
      </div>
    </div>
  );
}
