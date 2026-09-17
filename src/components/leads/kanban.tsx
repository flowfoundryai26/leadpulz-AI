"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Bot, Building2, Phone, Clock } from "lucide-react";
import type { Lead, LeadStage } from "@/types";
import { services } from "@/services";
import { LEAD_STAGES } from "@/lib/constants";
import { formatCurrency, timeAgo } from "@/lib/format";
import { ScorePill } from "@/components/ui/domain-badges";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function LeadKanbanCard({ lead, dragging }: { lead: Lead; dragging?: boolean }) {
  return (
    <Link href={`/leads/${lead.id}`} className={cn("block rounded-xl border border-border bg-surface p-3 shadow-card transition-all hover:border-border-strong", dragging && "opacity-50")}>
      <div className="flex items-start gap-2.5">
        <Avatar name={lead.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{lead.name}</p>
          {lead.company ? <p className="flex items-center gap-1 truncate text-[11px] text-muted"><Building2 className="size-3" />{lead.company}</p> : null}
        </div>
        <ScorePill score={lead.score} />
      </div>
      <p className="mt-2 truncate text-xs text-foreground-secondary">{lead.serviceInterest}</p>
      {lead.lastConversationSummary ? <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted">{lead.lastConversationSummary}</p> : null}
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
        <span className="flex items-center gap-1"><Bot className="size-3" />{lead.agentName ?? "—"}</span>
        <span className="font-medium text-foreground">{lead.estimatedValue ? formatCurrency(lead.estimatedValue) : "—"}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {lead.tags.slice(0, 2).map((t) => <Badge key={t} variant="muted">{t}</Badge>)}
        {lead.lastConversationAt ? <span className="ml-auto flex items-center gap-1 text-[10px] text-faint" suppressHydrationWarning><Clock className="size-3" />{timeAgo(lead.lastConversationAt)}</span> : null}
      </div>
      <span className="sr-only"><Phone />{lead.phone}</span>
    </Link>
  );
}

export function LeadKanban({ leads, onMove }: { leads: Lead[]; onMove: (id: string, stage: LeadStage) => void }) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<LeadStage | null>(null);

  const drop = async (stage: LeadStage) => {
    if (!dragId) return;
    const lead = leads.find((l) => l.id === dragId);
    setOver(null);
    setDragId(null);
    if (!lead || lead.stage === stage) return;
    onMove(lead.id, stage);
    try {
      await services.leads.setStage(lead.id, stage);
      toast.success(`${lead.name} moved to ${LEAD_STAGES.find((s) => s.value === stage)?.label}`);
    } catch (e) {
      toast.error((e as Error).message);
      onMove(lead.id, lead.stage);
    }
  };

  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:snap-none sm:px-0">
      {LEAD_STAGES.map((stage) => {
        const items = leads.filter((l) => l.stage === stage.value);
        const value = items.reduce((a, b) => a + b.estimatedValue, 0);
        return (
          <div
            key={stage.value}
            onDragOver={(e) => { e.preventDefault(); setOver(stage.value); }}
            onDragLeave={() => setOver(null)}
            onDrop={() => drop(stage.value)}
            className={cn("flex w-[min(272px,80vw)] shrink-0 snap-start flex-col rounded-2xl border border-border bg-background-subtle transition-colors sm:w-[272px]", over === stage.value && "border-primary/60 bg-primary-soft/20")}
          >
            <div className="flex items-center gap-2 px-3 py-2.5">
              <span className="size-2 rounded-full" style={{ background: stage.color }} />
              <p className="text-[13px] font-semibold">{stage.label}</p>
              <span className="rounded-md bg-surface-2 px-1.5 text-[11px] tabular-nums text-muted">{items.length}</span>
              <span className="ml-auto text-[11px] tabular-nums text-muted">{value ? formatCurrency(value) : ""}</span>
            </div>
            <div className="flex-1 space-y-2 px-2 pb-2">
              {items.map((l) => (
                <div key={l.id} draggable onDragStart={() => setDragId(l.id)} onDragEnd={() => setDragId(null)} className="cursor-grab active:cursor-grabbing">
                  <LeadKanbanCard lead={l} dragging={dragId === l.id} />
                </div>
              ))}
              {items.length === 0 ? <div className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-faint">Drop leads here</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
