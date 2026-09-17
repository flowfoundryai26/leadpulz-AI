"use client";

import Link from "next/link";
import { Bot, Calendar, Database, Mail, MessageCircle, PhoneCall, PhoneIncoming, PhoneOutgoing, Repeat, Smartphone, Sparkles, StickyNote, ArrowRightLeft, BellRing } from "lucide-react";
import type { TimelineEvent } from "@/types";
import { formatDate, formatTime } from "@/lib/format";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { isToday, isTomorrow, isYesterday } from "date-fns";

const iconFor: Record<TimelineEvent["type"], { icon: React.ReactNode; tone: string }> = {
  inbound_call: { icon: <PhoneIncoming />, tone: "bg-accent-soft text-accent border-accent/40" },
  outbound_call: { icon: <PhoneOutgoing />, tone: "bg-primary-soft text-[#a3a3ff] border-primary/40" },
  qualified: { icon: <Sparkles />, tone: "bg-primary-soft text-[#a3a3ff] border-primary/40" },
  whatsapp_sent: { icon: <MessageCircle />, tone: "bg-success-soft text-success border-success/40" },
  sms_sent: { icon: <Smartphone />, tone: "bg-accent-soft text-accent border-accent/40" },
  email_sent: { icon: <Mail />, tone: "bg-accent-soft text-accent border-accent/40" },
  appointment_booked: { icon: <Calendar />, tone: "bg-success-soft text-success border-success/40" },
  reminder_sent: { icon: <BellRing />, tone: "bg-warning-soft text-warning border-warning/40" },
  note: { icon: <StickyNote />, tone: "bg-surface-2 text-foreground-secondary border-border-strong" },
  stage_changed: { icon: <ArrowRightLeft />, tone: "bg-surface-2 text-foreground-secondary border-border-strong" },
  crm_updated: { icon: <Database />, tone: "bg-surface-2 text-foreground-secondary border-border-strong" },
  follow_up_scheduled: { icon: <Repeat />, tone: "bg-warning-soft text-warning border-warning/40" },
};

function dayLabel(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  if (isTomorrow(d)) return "Tomorrow";
  return formatDate(d, "EEE, dd MMM");
}

/** Unified customer interaction timeline — a LeadPulz core differentiator. */
export function CustomerTimeline({ events, className }: { events: TimelineEvent[]; className?: string }) {
  const groups = events.reduce<Record<string, TimelineEvent[]>>((acc, e) => {
    const k = dayLabel(e.at);
    (acc[k] ??= []).push(e);
    return acc;
  }, {});
  const [now] = useState(() => Date.now());

  return (
    <div className={cn("space-y-6", className)}>
      {Object.entries(groups).map(([day, items]) => (
        <div key={day}>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">{day}</p>
          <ol className="relative ml-4 space-y-4 border-l border-border">
            {items.map((e) => {
              const meta = iconFor[e.type];
              const future = new Date(e.at).getTime() > now;
              return (
                <li key={e.id} className={cn("relative pl-8", future && "opacity-70")}>
                  <span className={cn("absolute -left-[15px] top-0 flex size-[30px] items-center justify-center rounded-full border bg-surface [&_svg]:size-3.5", meta.tone)}>{meta.icon}</span>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <span className="font-mono text-[11px] tabular-nums text-muted" suppressHydrationWarning>{formatTime(e.at)}</span>
                    <p className="text-sm font-medium text-foreground">{e.title}</p>
                    {future ? <span className="rounded bg-warning-soft px-1.5 text-[10px] text-warning">Scheduled</span> : null}
                  </div>
                  {e.description ? <p className="mt-0.5 text-[13px] text-foreground-secondary">{e.description}</p> : null}
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                    {e.actor.includes("(AI)") ? <Bot className="size-3" /> : null}
                    {e.actor}
                    {e.refId ? <Link href={`/calls/${e.refId}`} className="ml-2 inline-flex items-center gap-1 text-[#a3a3ff] hover:underline"><PhoneCall className="size-3" /> View call</Link> : null}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}
