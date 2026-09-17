"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Radio, ArrowRight } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import type { LiveCall } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SentimentBadge } from "@/components/ui/domain-badges";
import { Skeleton } from "@/components/ui/primitives";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { formatDuration } from "@/lib/format";
import { SectionHeader } from "@/components/ui/page-header";

/** Ticking duration — the call is live so the clock must move. */
function LiveTimer({ startedAt }: { startedAt: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const sec = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000));
  return <span className="font-mono tabular-nums text-foreground" suppressHydrationWarning>{formatDuration(sec)}</span>;
}

export function Waveform({ className }: { className?: string }) {
  return (
    <span className={"inline-flex h-4 items-end gap-[2px] " + (className ?? "")} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="w-[3px] rounded-sm bg-accent animate-wave origin-bottom" style={{ height: "100%", animationDelay: `${i * 0.12}s` }} />
      ))}
    </span>
  );
}

export function LiveCallCard({ call }: { call: LiveCall }) {
  return (
    <Card className="relative overflow-hidden p-4">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">AI Agent</p>
          <p className="truncate text-sm font-semibold text-foreground">{call.agentName}</p>
        </div>
        <Waveform />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
        <div>
          <p className="text-[11px] text-muted">Customer</p>
          <p className="truncate font-medium">{call.customerName}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted">Call Duration</p>
          <LiveTimer startedAt={call.startedAt} />
        </div>
        <div className="col-span-2">
          <p className="text-[11px] text-muted">Status</p>
          <Badge variant="accent" dot pulse className="mt-0.5">
            {call.stage}
          </Badge>
        </div>
        <div>
          <p className="text-[11px] text-muted">Intent</p>
          <p className="truncate font-medium">{call.intent}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted">Sentiment</p>
          <div className="mt-0.5">
            <SentimentBadge sentiment={call.sentiment} />
          </div>
        </div>
      </div>
      <Button asChild variant="secondary" size="sm" className="mt-4 w-full">
        <Link href={`/calls/live/${call.id}`}>
          View Live Call <ArrowRight />
        </Link>
      </Button>
    </Card>
  );
}

export function LiveAgentActivity() {
  const { data, loading, error, refetch } = useQuery(() => services.calls.getLive(), []);
  return (
    <section>
      <SectionHeader
        title={
          <span className="flex items-center gap-2">
            <Radio className="size-4 text-accent" /> Live Agent Activity
            {data?.length ? <Badge variant="accent" dot pulse>{data.length} active</Badge> : null}
          </span>
        }
        description="Calls your AI agents are handling right now."
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/calls/live">All live calls</Link>
          </Button>
        }
      />
      {error ? (
        <ErrorState error={error} onRetry={refetch} compact />
      ) : loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : data?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((c) => (
            <LiveCallCard key={c.id} call={c} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState compact icon={<Radio />} title="No live calls right now" description="Your agents are online and ready. Active conversations will appear here in real time." />
        </Card>
      )}
    </section>
  );
}
