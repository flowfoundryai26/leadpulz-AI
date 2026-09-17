"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Bot, Calendar, CalendarPlus, Check, Clock, ExternalLink, Phone, UserCircle2, XCircle, RotateCcw, CheckCircle2 } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import type { Appointment, AppointmentStatus } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { Avatar, Skeleton } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ui/states";
import { AppointmentStatusBadge } from "@/components/ui/domain-badges";
import { CalendarToolbar, MonthView, WeekView, type CalView } from "@/components/appointments/calendar";
import { formatCurrency, formatDateTime, formatTime, formatDate } from "@/lib/format";
import { addMinutes } from "date-fns";

const calendars = [
  { key: "google", name: "Google Calendar", status: "connected" },
  { key: "outlook", name: "Microsoft Outlook", status: "available" },
  { key: "calcom", name: "Cal.com", status: "available" },
  { key: "calendly", name: "Calendly", status: "available" },
];

function BookDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; onDone: () => void }) {
  const [form, setForm] = useState({ customerName: "", customerPhone: "", service: "Implant Consultation", staff: "Dr. Kavya Nair", date: formatDate(new Date(), "yyyy-MM-dd"), time: "11:00", duration: "45" });
  const [pending, setPending] = useState(false);
  const submit = async () => {
    setPending(true);
    const startsAt = new Date(`${form.date}T${form.time}:00`);
    await services.appointments.create({
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      service: form.service,
      staff: form.staff,
      startsAt: startsAt.toISOString(),
      endsAt: addMinutes(startsAt, Number(form.duration)).toISOString(),
      status: "confirmed",
      calendarProvider: "google",
      agentName: "Manual",
    });
    setPending(false);
    toast.success("Appointment booked", { description: "Synced to Google Calendar. Confirmation sent via WhatsApp." });
    onOpenChange(false);
    onDone();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Book appointment</DialogTitle><DialogDescription>Checks availability on the connected calendar before confirming.</DialogDescription></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer" required><Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} /></Field>
          <Field label="Phone" required><Input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} className="font-mono" /></Field>
          <Field label="Service"><SimpleSelect value={form.service} onValueChange={(v) => setForm({ ...form, service: v })} options={["Implant Consultation", "Routine Check-up & Cleaning", "Teeth Whitening", "Aligner Fitting", "Root Canal — Sitting 1", "Crown Fitting", "Site Visit — Skyline Meadows"].map((s) => ({ value: s, label: s }))} /></Field>
          <Field label="Assigned staff"><SimpleSelect value={form.staff} onValueChange={(v) => setForm({ ...form, staff: v })} options={["Dr. Kavya Nair", "Dr. Anil Kumar", "Dr. Ritu Sharma", "Divya Menon"].map((s) => ({ value: s, label: s }))} /></Field>
          <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Time"><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
          <Field label="Duration"><SimpleSelect value={form.duration} onValueChange={(v) => setForm({ ...form, duration: v })} options={["30", "45", "60", "90"].map((d) => ({ value: d, label: `${d} minutes` }))} /></Field>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} loading={pending} disabled={!form.customerName || !form.customerPhone}>Book appointment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AppointmentsContent() {
  const params = useSearchParams();
  const { data, loading, error, refetch } = useQuery(() => services.appointments.list(), []);
  const [view, setView] = useState<CalView>("week");
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [bookOpen, setBookOpen] = useState(params.get("new") === "1");
  // Sync dialog/focus state from the URL (external system) — intentional.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (params.get("new") === "1") setBookOpen(true); }, [params]);
   
  useEffect(() => {
    const f = params.get("focus");
    if (f && data) { const a = data.find((x) => x.id === f); if (a) { setSelected(a); setCursor(new Date(a.startsAt)); } }
  }, [params, data]);

  const [now] = useState(() => Date.now());
  const upcoming = useMemo(() => (data ?? []).filter((a) => new Date(a.startsAt).getTime() > now && a.status !== "cancelled"), [data, now]);
  const stats = useMemo(() => {
    const all = data ?? [];
    return { today: all.filter((a) => formatDate(a.startsAt) === formatDate(new Date())).length, week: upcoming.length, byAi: all.filter((a) => a.agentName && a.agentName !== "Manual").length, noShow: all.filter((a) => a.status === "no_show").length };
  }, [data, upcoming]);

  const setStatus = async (a: Appointment, s: AppointmentStatus) => {
    await services.appointments.setStatus(a.id, s);
    toast.success(`Marked as ${s.replace("_", " ")}`);
    setSelected(null);
    refetch();
  };

  const columns: Column<Appointment>[] = [
    { key: "customer", header: "Customer", sortValue: (a) => a.customerName, cell: (a) => <div className="flex items-center gap-3"><Avatar name={a.customerName} size="sm" /><div><p className="font-medium">{a.customerName}</p><p className="font-mono text-xs text-muted">{a.customerPhone}</p></div></div> },
    { key: "service", header: "Service", cell: (a) => a.service },
    { key: "staff", header: "Assigned staff", cell: (a) => a.staff },
    { key: "when", header: "Date & time", sortValue: (a) => a.startsAt, cell: (a) => <span className="whitespace-nowrap text-xs" suppressHydrationWarning>{formatDateTime(a.startsAt)}</span> },
    { key: "agent", header: "AI agent", cell: (a) => <span className="flex items-center gap-1.5 text-xs"><Bot className="size-3.5 text-[#a3a3ff]" />{a.agentName ?? "—"}</span> },
    { key: "value", header: "Value", sortValue: (a) => a.estimatedValue ?? 0, cell: (a) => <span className="tabular-nums">{a.estimatedValue ? formatCurrency(a.estimatedValue) : "—"}</span> },
    { key: "status", header: "Status", sortValue: (a) => a.status, cell: (a) => <AppointmentStatusBadge status={a.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Appointments" description="Bookings made by your AI agents and your team, synced with your calendar." actions={<Button onClick={() => setBookOpen(true)}><CalendarPlus /> Book Appointment</Button>} />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {[["Today", stats.today, <Calendar key="a" />], ["Upcoming", stats.week, <Clock key="b" />], ["Booked by AI", stats.byAi, <Bot key="c" />], ["No-shows (30d)", stats.noShow, <XCircle key="d" />]].map(([l, v, i]) => (
          <Card key={String(l)} className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-[#a3a3ff] [&_svg]:size-5 sm:size-10">{i as React.ReactNode}</span>
            <div className="min-w-0"><p className="truncate text-xs text-muted">{l as string}</p><p className="text-xl font-semibold tabular-nums sm:text-2xl">{loading ? "—" : (v as number)}</p></div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <CalendarToolbar view={view} setView={setView} cursor={cursor} setCursor={setCursor} />
          {error ? <ErrorState error={error} onRetry={refetch} /> : loading ? <Skeleton className="h-[560px] rounded-2xl" /> : view === "month" ? (
            <MonthView cursor={cursor} appointments={data ?? []} onSelect={setSelected} />
          ) : view === "list" ? (
            <DataTable columns={columns} rows={[...(data ?? [])].sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())} rowKey={(a) => a.id} onRowClick={setSelected} emptyTitle="No appointments" />
          ) : (
            <WeekView cursor={cursor} appointments={data ?? []} onSelect={setSelected} single={view === "day"} />
          )}
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Calendar integrations</CardTitle><CardDescription>Agents check availability, book, reschedule, cancel and send reminders.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {calendars.map((c) => (
                <div key={c.key} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                  <span className="flex-1">{c.name}</span>
                  {c.status === "connected" ? <Badge variant="success" dot>Connected</Badge> : <Button variant="ghost" size="xs" onClick={() => toast.info(`Redirecting to ${c.name} OAuth…`)}>Connect</Button>}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Next up</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {upcoming.slice(0, 5).map((a) => (
                <button key={a.id} type="button" onClick={() => setSelected(a)} className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-surface-2">
                  <span className="font-mono text-xs text-muted" suppressHydrationWarning>{formatTime(a.startsAt)}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{a.customerName}</span><span className="block truncate text-xs text-muted">{a.service}</span></span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        {selected ? (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3"><Avatar name={selected.customerName} />{selected.customerName}</DialogTitle>
              <DialogDescription>{selected.service}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info icon={<Clock />} label="When" value={<span suppressHydrationWarning>{formatDateTime(selected.startsAt)} – {formatTime(selected.endsAt)}</span>} />
              <Info icon={<UserCircle2 />} label="Assigned staff" value={selected.staff} />
              <Info icon={<Phone />} label="Phone" value={<span className="font-mono">{selected.customerPhone}</span>} />
              <Info icon={<Bot />} label="Booked by" value={selected.agentName ?? "—"} />
              <Info icon={<Calendar />} label="Calendar" value={<span className="capitalize">{selected.calendarProvider}</span>} />
              <Info icon={<Check />} label="Status" value={<AppointmentStatusBadge status={selected.status} />} />
            </div>
            {selected.notes ? <p className="rounded-lg bg-surface-2/60 p-3 text-sm text-foreground-secondary">{selected.notes}</p> : null}
            <DialogFooter className="flex-wrap sm:justify-between">
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => toast.success("Reminder sent via WhatsApp")}>Send reminder</Button>
                <Button variant="secondary" size="sm" onClick={() => toast.info("Opening reschedule…")}><RotateCcw /> Reschedule</Button>
              </div>
              <div className="flex gap-2">
                <Button variant="danger-ghost" size="sm" onClick={() => setStatus(selected, "cancelled")}>Cancel</Button>
                {selected.status !== "completed" ? <Button size="sm" onClick={() => setStatus(selected, "completed")}><CheckCircle2 /> Mark completed</Button> : null}
                {selected.leadId ? <Button asChild variant="ghost" size="sm"><a href={`/leads/${selected.leadId}`}><ExternalLink /> Lead</a></Button> : null}
              </div>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
      <BookDialog open={bookOpen} onOpenChange={setBookOpen} onDone={refetch} />
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return <div className="rounded-lg border border-border p-2.5"><p className="flex items-center gap-1.5 text-[11px] text-muted [&_svg]:size-3.5">{icon}{label}</p><div className="mt-1 font-medium">{value}</div></div>;
}

export default function AppointmentsPage() {
  return <Suspense><AppointmentsContent /></Suspense>;
}
