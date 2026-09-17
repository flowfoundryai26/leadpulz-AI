"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Mail, MessageCircle, PhoneCall, Smartphone, Search, Globe } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, Skeleton } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { Transcript } from "@/components/calls/transcript";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Channel } from "@/types";

const channelMeta: Record<string, { icon: React.ReactNode; label: string }> = {
  voice: { icon: <PhoneCall />, label: "Voice" },
  whatsapp: { icon: <MessageCircle />, label: "WhatsApp" },
  sms: { icon: <Smartphone />, label: "SMS" },
  email: { icon: <Mail />, label: "Email" },
  web_chat: { icon: <Globe />, label: "Web chat" },
};

/**
 * Unified conversation inbox. Voice today; WhatsApp/SMS/email threads share
 * the same customer context so the same agent can continue across channels.
 */
export default function ConversationsPage() {
  const calls = useQuery(() => services.calls.list({ pageSize: 60 }), []);
  const [channel, setChannel] = useState<"all" | Channel>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [nowIso] = useState(() => new Date().toISOString());

  const threads = useMemo(() => {
    const voice = (calls.data?.items ?? []).filter((c) => c.durationSec > 0).map((c) => ({
      id: c.id,
      channel: "voice" as Channel,
      name: c.customerName,
      preview: c.summary?.summary ?? `${c.intent} — ${c.agentName.split(" — ")[0]}`,
      at: c.startedAt,
      agent: c.agentName.split(" — ")[0],
      unread: c.outcome === "callback_requested",
      call: c,
    }));
    const extra = [
      { id: "wa_rahul", channel: "whatsapp" as Channel, name: "Rahul Sharma", preview: "Booking confirmation sent · Read ✓✓", at: calls.data?.items.find((c) => c.id === "call_rahul")?.startedAt ?? new Date().toISOString(), agent: "Maya", unread: false, call: undefined },
      { id: "wa_priya", channel: "whatsapp" as Channel, name: "Priya Reddy", preview: "Wedding-season whitening package — ₹9,900 · Delivered", at: calls.data?.items.find((c) => c.id === "call_priya")?.startedAt ?? new Date().toISOString(), agent: "Maya", unread: true, call: undefined },
      { id: "sms_arjun", channel: "sms" as Channel, name: "Arjun Patel", preview: "Reminder: Site visit Saturday 11:00 AM at Skyline Experience Centre.", at: nowIso, agent: "Arjun", unread: false, call: undefined },
      { id: "em_karthik", channel: "email" as Channel, name: "Karthik Reddy", preview: "Your aligner treatment plan and EMI options", at: new Date(new Date(nowIso).getTime() - 5 * 3600_000).toISOString(), agent: "Maya", unread: false, call: undefined },
    ];
    return [...voice, ...extra]
      .filter((t) => (channel === "all" || t.channel === channel) && (!q || t.name.toLowerCase().includes(q.toLowerCase())))
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [calls.data, channel, q, nowIso]);

  const active = threads.find((t) => t.id === selected) ?? threads[0];

  return (
    <div>
      <PageHeader title="Conversations" description="Every customer interaction across voice, WhatsApp, SMS and email — one unified inbox." />
      {/* Master/detail: phones show one pane at a time, desktop shows both. */}
      <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Card className={cn("flex max-h-[75dvh] min-h-[320px] flex-col overflow-hidden", selected && "hidden lg:flex")}>
          <div className="space-y-2 border-b border-border p-3">
            <Input placeholder="Search conversations…" value={q} onChange={(e) => setQ(e.target.value)} leftIcon={<Search />} />
            <div className="flex flex-wrap gap-1">
              {(["all", "voice", "whatsapp", "sms", "email"] as const).map((c) => (
                <button key={c} type="button" onClick={() => setChannel(c)} className={cn("rounded-md px-2 py-1 text-[11px] font-medium capitalize", channel === c ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground")}>
                  {c === "all" ? "All" : channelMeta[c].label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {calls.loading ? (
              <div className="space-y-2 p-3">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14" />)}</div>
            ) : threads.length === 0 ? (
              <EmptyState compact title="No conversations" />
            ) : (
              <ul className="divide-y divide-border">
                {threads.map((t) => (
                  <li key={t.id}>
                    <button type="button" onClick={() => setSelected(t.id)} className={cn("flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-surface-2", active?.id === t.id && "bg-primary-soft/40")}>
                      <Avatar name={t.name} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className={cn("truncate text-sm", t.unread ? "font-semibold text-foreground" : "font-medium")}>{t.name}</span>
                          <span className="ml-auto shrink-0 text-[10px] text-muted" suppressHydrationWarning>{formatRelative(t.at)}</span>
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                          <span className="[&_svg]:size-3">{channelMeta[t.channel].icon}</span>
                          <span className="truncate">{t.preview}</span>
                        </span>
                      </span>
                      {t.unread ? <span className="mt-2 size-2 rounded-full bg-primary" /> : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card className={cn("flex max-h-[75dvh] min-h-[480px] flex-col", !selected && "hidden lg:flex")}>
          {active ? (
            <>
              <div className="flex flex-wrap items-center gap-3 border-b border-border p-3 sm:p-4">
                <button type="button" onClick={() => setSelected(null)} className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground lg:hidden" aria-label="Back to conversations">
                  <ArrowLeft className="size-4" />
                </button>
                <Avatar name={active.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{active.name}</p>
                  <p className="flex items-center gap-1.5 truncate text-xs text-muted"><span className="shrink-0 [&_svg]:size-3">{channelMeta[active.channel].icon}</span><span className="truncate">{channelMeta[active.channel].label} · handled by {active.agent}</span></p>
                </div>
                <Badge variant="muted" className="hidden sm:inline-flex">{channelMeta[active.channel].label}</Badge>
                {active.call ? (
                  <Link href={`/calls/${active.call.id}`} className="shrink-0 text-xs text-[#a3a3ff] hover:underline">
                    <span className="sm:hidden">Details</span>
                    <span className="hidden sm:inline">Open call details</span>
                  </Link>
                ) : null}
              </div>
              <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                {active.call ? (
                  <Transcript turns={active.call.transcript ?? []} agentName={active.agent} />
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-start"><div className="max-w-[85%] rounded-2xl sm:max-w-[70%] rounded-tl-sm bg-surface-2 px-3.5 py-2 text-sm">{active.preview}</div></div>
                    <p className="text-center text-xs text-faint">Same agent · same customer context · different channel.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <EmptyState title="Select a conversation" />
          )}
        </Card>
      </div>
    </div>
  );
}
