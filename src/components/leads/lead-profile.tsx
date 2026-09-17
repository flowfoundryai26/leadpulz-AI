"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Bot, Building2, Calendar, IndianRupee, Mail, MapPin, MessageCircle, Phone, PhoneCall, Send, Tag, UserCircle2 } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import type { LeadStage } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, Progress, Skeleton } from "@/components/ui/primitives";
import { ErrorState, PageSkeleton } from "@/components/ui/states";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/input";
import { LeadQualityBadge, AppointmentStatusBadge, OutcomeBadge } from "@/components/ui/domain-badges";
import { CustomerTimeline } from "./timeline";
import { Transcript } from "@/components/calls/transcript";
import { AudioPlayer } from "@/components/calls/audio-player";
import { MakeCallDialog } from "@/components/calls/make-call-dialog";
import { LEAD_STAGES } from "@/lib/constants";
import { formatCurrency, formatDateTime, formatDuration, formatRelative } from "@/lib/format";

export function LeadProfile({ leadId }: { leadId: string }) {
  const router = useRouter();
  const lead = useQuery(() => services.leads.get(leadId), [leadId]);
  const timeline = useQuery(() => services.leads.getTimeline(leadId), [leadId]);
  const calls = useQuery(() => services.leads.getCalls(leadId), [leadId]);
  const notes = useQuery(() => services.leads.getNotes(leadId), [leadId]);
  const appts = useQuery(() => services.leads.getAppointments(leadId), [leadId]);
  const [note, setNote] = useState("");
  const [callOpen, setCallOpen] = useState(false);

  if (lead.error) return <ErrorState error={lead.error} onRetry={lead.refetch} />;
  if (lead.loading) return <PageSkeleton />;
  const l = lead.data;
  if (!l) return <ErrorState error={{ name: "ServiceError", message: "Lead not found.", code: "not_found" } as never} onRetry={() => router.push("/leads")} />;

  const setStage = async (s: string) => {
    await services.leads.setStage(l.id, s as LeadStage);
    toast.success(`Stage updated to ${LEAD_STAGES.find((x) => x.value === s)?.label}`);
    lead.refetch();
  };

  const addNote = async () => {
    if (!note.trim()) return;
    await services.leads.addNote(l.id, note.trim());
    setNote("");
    notes.refetch();
    toast.success("Note added");
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Leads", href: "/leads" }, { label: l.name }]}
        title={<span className="flex items-center gap-3"><Avatar name={l.name} size="lg" />{l.name}<LeadQualityBadge quality={l.quality} /></span>}
        description={<span>{l.serviceInterest} · {l.company ?? "Individual"} · Created <span suppressHydrationWarning>{formatRelative(l.createdAt)}</span></span>}
        actions={
          <>
            <SimpleSelect value={l.stage} onValueChange={setStage} className="w-48" options={LEAD_STAGES.map((s) => ({ value: s.value, label: s.label }))} />
            <Button variant="secondary" onClick={() => toast.success("WhatsApp template sent")}><MessageCircle /> WhatsApp</Button>
            <Button onClick={() => setCallOpen(true)}><PhoneCall /> Call with AI</Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        {/* Left column */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Lead score</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-semibold tabular-nums">{l.score}</span>
                <span className="text-sm text-muted">/ 100</span>
              </div>
              <Progress value={l.score} tone={l.score >= 75 ? "danger" : l.score >= 50 ? "warning" : "accent"} className="mt-3" />
              <p className="mt-2 text-xs text-muted">Scored by {l.agentName ?? "AI"} from qualification answers: service, timeline, budget, location, decision-maker.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Contact information</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row icon={<Phone />} label="Phone"><a href={`tel:${l.phone}`} className="font-mono hover:underline">{l.phone}</a></Row>
              <Row icon={<Mail />} label="Email">{l.email ? <a href={`mailto:${l.email}`} className="hover:underline">{l.email}</a> : "—"}</Row>
              <Row icon={<Building2 />} label="Company">{l.company ?? "—"}</Row>
              <Row icon={<MapPin />} label="Location">{l.location ?? "—"}</Row>
              <Row icon={<UserCircle2 />} label="Owner">{l.owner ?? "Unassigned"}</Row>
              <Row icon={<Bot />} label="AI agent">{l.agentName ?? "—"}</Row>
              <Row icon={<Tag />} label="Source"><span className="capitalize">{l.source.replace("_", " ")}</span></Row>
              <div className="flex flex-wrap gap-1 pt-1">{l.tags.map((t) => <Badge key={t} variant="muted">{t}</Badge>)}</div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-success/15 blur-3xl" />
            <CardHeader><CardTitle className="flex items-center gap-2"><IndianRupee className="size-4 text-success" /> Revenue opportunity</CardTitle></CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">{formatCurrency(l.estimatedValue)}</p>
              <p className="mt-1 text-xs text-muted">Estimated from service interest. Updated when the deal is won.</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-surface-2/60 p-2.5"><p className="text-muted">Win probability</p><p className="text-lg font-semibold">{Math.min(95, Math.round(l.score * 0.9))}%</p></div>
                <div className="rounded-lg bg-surface-2/60 p-2.5"><p className="text-muted">Weighted value</p><p className="text-lg font-semibold">{formatCurrency(Math.round((l.estimatedValue * Math.min(95, l.score * 0.9)) / 100))}</p></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer timeline</CardTitle>
              <CardDescription>Every touchpoint across calls, WhatsApp, SMS, email and CRM — in one place.</CardDescription>
            </CardHeader>
            <CardContent>
              {timeline.loading ? <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div> : timeline.data?.length ? <CustomerTimeline events={timeline.data} /> : <p className="text-sm text-muted">No activity yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <Tabs defaultValue="conversations">
              <CardHeader>
                <TabsList>
                  <TabsTrigger value="conversations">Conversations</TabsTrigger>
                  <TabsTrigger value="recordings">Recordings</TabsTrigger>
                  <TabsTrigger value="appointments">Appointments</TabsTrigger>
                  <TabsTrigger value="followups">Follow-ups</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="conversations" className="mt-0 space-y-6">
                  {calls.loading ? <Skeleton className="h-40" /> : calls.data?.length ? calls.data.map((c) => (
                    <div key={c.id} className="rounded-xl border border-border p-4">
                      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium">{c.intent}</span>
                        <OutcomeBadge outcome={c.outcome} />
                        <span className="ml-auto text-xs text-muted" suppressHydrationWarning>{formatDateTime(c.startedAt)} · {formatDuration(c.durationSec)}</span>
                        <Link href={`/calls/${c.id}`} className="text-xs text-[#a3a3ff] hover:underline">Full details</Link>
                      </div>
                      {c.summary ? <p className="mb-3 rounded-lg bg-surface-2/60 p-3 text-[13px] text-foreground-secondary">{c.summary.summary}</p> : null}
                      <Transcript turns={(c.transcript ?? []).slice(0, 6)} agentName={c.agentName.split(" ")[0]} />
                      {(c.transcript?.length ?? 0) > 6 ? <Link href={`/calls/${c.id}`} className="mt-3 inline-block text-xs text-muted hover:text-foreground">+ {c.transcript!.length - 6} more turns</Link> : null}
                    </div>
                  )) : <p className="text-sm text-muted">No conversations yet.</p>}
                </TabsContent>
                <TabsContent value="recordings" className="mt-0 space-y-4">
                  {calls.data?.filter((c) => c.recordingUrl).map((c) => (
                    <div key={c.id}>
                      <p className="mb-2 text-sm font-medium">{c.intent} <span className="text-xs text-muted" suppressHydrationWarning>· {formatDateTime(c.startedAt)}</span></p>
                      <AudioPlayer src={c.recordingUrl} durationSec={c.durationSec} seed={c.id.length * 7} />
                    </div>
                  ))}
                  {!calls.data?.some((c) => c.recordingUrl) ? <p className="text-sm text-muted">No recordings.</p> : null}
                </TabsContent>
                <TabsContent value="appointments" className="mt-0">
                  {appts.data?.length ? (
                    <ul className="divide-y divide-border">
                      {appts.data.map((a) => (
                        <li key={a.id} className="flex items-center gap-3 py-3">
                          <span className="flex size-9 items-center justify-center rounded-lg bg-success-soft text-success"><Calendar className="size-4" /></span>
                          <div className="min-w-0 flex-1"><p className="text-sm font-medium">{a.service}</p><p className="text-xs text-muted" suppressHydrationWarning>{formatDateTime(a.startsAt)} · {a.staff}</p></div>
                          <AppointmentStatusBadge status={a.status} />
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-muted">No appointments yet. <Link href="/appointments?new=1" className="text-[#a3a3ff] hover:underline">Book one</Link>.</p>}
                </TabsContent>
                <TabsContent value="followups" className="mt-0">
                  <ul className="space-y-2 text-sm">
                    {(timeline.data ?? []).filter((e) => e.type === "follow_up_scheduled" || e.type === "reminder_sent").map((e) => (
                      <li key={e.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                        <span className="flex-1"><span className="font-medium">{e.title}</span><span className="block text-xs text-muted">{e.description}</span></span>
                        <span className="text-xs text-muted" suppressHydrationWarning>{formatDateTime(e.at)}</span>
                      </li>
                    ))}
                    {!(timeline.data ?? []).some((e) => e.type === "follow_up_scheduled" || e.type === "reminder_sent") ? <li className="text-muted">No follow-ups scheduled. <Link href="/follow-ups" className="text-[#a3a3ff] hover:underline">Enrol in a sequence</Link>.</li> : null}
                  </ul>
                </TabsContent>
                <TabsContent value="notes" className="mt-0 space-y-4">
                  <div className="flex gap-2">
                    <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note for your team…" className="min-h-[60px]" />
                    <Button onClick={addNote} disabled={!note.trim()} aria-label="Add note"><Send /></Button>
                  </div>
                  <ul className="space-y-3">
                    {notes.data?.map((n) => (
                      <li key={n.id} className="rounded-lg border border-border bg-surface-2/40 p-3">
                        <p className="text-sm text-foreground-secondary">{n.body}</p>
                        <p className="mt-1.5 text-[11px] text-muted" suppressHydrationWarning>{n.author} · {formatRelative(n.createdAt)}</p>
                      </li>
                    ))}
                    {notes.data?.length === 0 ? <li className="text-sm text-muted">No notes yet.</li> : null}
                  </ul>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
      <MakeCallDialog open={callOpen} onOpenChange={setCallOpen} defaultPhone={l.phone} defaultName={l.name} />
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted [&_svg]:size-4">{icon}</span>
      <div className="min-w-0 flex-1"><p className="text-[11px] text-muted">{label}</p><div className="truncate text-foreground">{children}</div></div>
    </div>
  );
}
