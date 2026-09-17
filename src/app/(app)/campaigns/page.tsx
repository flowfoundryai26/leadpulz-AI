"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bot, Megaphone, MoreHorizontal, Pause, Play, Plus, Users } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import type { Campaign } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress, Skeleton } from "@/components/ui/primitives";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { CampaignStatusBadge } from "@/components/ui/domain-badges";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CAMPAIGN_TYPE_LABEL } from "@/lib/constants";
import { formatDate, formatNumber, formatPercent } from "@/lib/format";
import { MiniBars } from "@/components/charts";

function CampaignCard({ c, onChange }: { c: Campaign; onChange: () => void }) {
  const router = useRouter();
  const progress = c.totalContacts ? (c.stats.attempted / c.totalContacts) * 100 : 0;
  const conv = c.stats.answered ? (c.stats.appointments / c.stats.answered) * 100 : 0;
  const toggle = async () => {
    const next = c.status === "running" ? "paused" : "running";
    await services.campaigns.setStatus(c.id, next);
    toast.success(next === "running" ? "Campaign resumed" : "Campaign paused");
    onChange();
  };
  return (
    <Card interactive className="p-5" onClick={() => router.push(`/campaigns/${c.id}`)}>
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-[#a3a3ff]"><Megaphone className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{c.name}</p>
          <p className="truncate text-xs text-muted">{CAMPAIGN_TYPE_LABEL[c.type]} · <Bot className="inline size-3" /> {c.agentName.split(" — ")[0]}</p>
        </div>
        <CampaignStatusBadge status={c.status} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" onClick={(e) => e.stopPropagation()} aria-label="Campaign actions"><MoreHorizontal /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            {c.status === "running" || c.status === "paused" || c.status === "scheduled" ? <DropdownMenuItem onClick={toggle}>{c.status === "running" ? <><Pause /> Pause</> : <><Play /> Start</>}</DropdownMenuItem> : null}
            <DropdownMenuItem asChild><Link href={`/campaigns/${c.id}`}>View analytics</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-muted"><span>{formatNumber(c.stats.attempted)} of {formatNumber(c.totalContacts)} contacts</span><span>{progress.toFixed(0)}%</span></div>
        <Progress value={progress} tone={c.status === "running" ? "primary" : "accent"} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        {[["Answered", c.stats.answered], ["Qualified", c.stats.qualified], ["Booked", c.stats.appointments], ["Conv.", formatPercent(conv)]].map(([l, v]) => (
          <div key={String(l)} className="rounded-lg bg-surface-2/60 py-2"><p className="text-sm font-semibold tabular-nums">{typeof v === "number" ? formatNumber(v) : v}</p><p className="text-[10px] text-muted">{l}</p></div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
        <span suppressHydrationWarning>{formatDate(c.startDate)}{c.endDate ? ` → ${formatDate(c.endDate)}` : ""}</span>
        <MiniBars values={[c.stats.noAnswer, c.stats.voicemail, c.stats.answered, c.stats.interested, c.stats.qualified, c.stats.appointments]} />
      </div>
    </Card>
  );
}

export default function CampaignsPage() {
  const { data, loading, error, refetch } = useQuery(() => services.campaigns.list(), []);
  return (
    <div>
      <PageHeader title="Campaigns" description="Outbound calling campaigns run by your AI agents — follow-ups, reactivation, reminders and outreach." actions={<Button asChild><Link href="/campaigns/new"><Plus /> Create Campaign</Link></Button>} />
      {error ? <ErrorState error={error} onRetry={refetch} /> : loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}</div>
      ) : data?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.map((c) => <CampaignCard key={c.id} c={c} onChange={refetch} />)}</div>
      ) : (
        <EmptyState icon={<Users />} title="No campaigns yet" description="Upload a contact list and let an AI agent call every lead within minutes." action={<Button asChild><Link href="/campaigns/new"><Plus /> Create Campaign</Link></Button>} />
      )}
    </div>
  );
}
