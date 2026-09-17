"use client";

import { useMemo } from "react";
import { addDays, addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Appointment, AppointmentStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/format";

export type CalView = "day" | "week" | "month" | "list";

const statusTone: Record<AppointmentStatus, string> = {
  confirmed: "border-success/50 bg-success-soft text-success",
  pending: "border-warning/50 bg-warning-soft text-warning",
  completed: "border-border-strong bg-surface-2 text-foreground-secondary",
  cancelled: "border-border bg-surface-2/50 text-faint line-through",
  no_show: "border-danger/50 bg-danger-soft text-danger",
};

export function CalendarToolbar({ view, setView, cursor, setCursor }: { view: CalView; setView: (v: CalView) => void; cursor: Date; setCursor: (d: Date) => void }) {
  const step = (dir: 1 | -1) => setCursor(view === "day" ? addDays(cursor, dir) : view === "week" ? addWeeks(cursor, dir) : addMonths(cursor, dir));
  const label = view === "day" ? format(cursor, "EEEE, dd MMM yyyy") : view === "week" ? `${format(startOfWeek(cursor, { weekStartsOn: 1 }), "dd MMM")} – ${format(endOfWeek(cursor, { weekStartsOn: 1 }), "dd MMM yyyy")}` : format(cursor, "MMMM yyyy");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1">
        <Button variant="secondary" size="icon-sm" onClick={() => step(-1)} aria-label="Previous"><ChevronLeft /></Button>
        <Button variant="secondary" size="sm" onClick={() => setCursor(new Date())}>Today</Button>
        <Button variant="secondary" size="icon-sm" onClick={() => step(1)} aria-label="Next"><ChevronRight /></Button>
      </div>
      <p className="text-sm font-semibold">{label}</p>
      <div className="ml-auto inline-flex rounded-lg border border-border bg-background-subtle p-1">
        {(["day", "week", "month", "list"] as CalView[]).map((v) => (
          <button key={v} type="button" onClick={() => setView(v)} className={cn("rounded-md px-2.5 py-1 text-xs font-medium capitalize", view === v ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground")}>{v}</button>
        ))}
      </div>
    </div>
  );
}

function Chip({ a, onClick, compact }: { a: Appointment; onClick: () => void; compact?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={cn("w-full truncate rounded-md border px-1.5 py-1 text-left text-[11px] font-medium leading-tight transition-colors hover:brightness-125", statusTone[a.status])}>
      {!compact ? <span className="mr-1 font-mono opacity-80">{format(new Date(a.startsAt), "HH:mm")}</span> : null}
      {a.customerName}
      {!compact ? <span className="block truncate font-normal opacity-80">{a.service}</span> : null}
    </button>
  );
}

export function MonthView({ cursor, appointments, onSelect }: { cursor: Date; appointments: Appointment[]; onSelect: (a: Appointment) => void }) {
  const days = useMemo(() => eachDayOfInterval({ start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }) }), [cursor]);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="grid grid-cols-7 border-b border-border text-center text-[11px] font-semibold uppercase tracking-wider text-muted">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="py-2">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const items = appointments.filter((a) => isSameDay(new Date(a.startsAt), d));
          return (
            <div key={d.toISOString()} className={cn("min-h-[104px] border-b border-r border-border p-1.5", !isSameMonth(d, cursor) && "bg-background-subtle/60")}>
              <p className={cn("mb-1 flex size-6 items-center justify-center rounded-full text-xs", isToday(d) ? "bg-primary font-semibold text-white" : !isSameMonth(d, cursor) ? "text-faint" : "text-foreground-secondary")}>{format(d, "d")}</p>
              <div className="space-y-1">
                {items.slice(0, 3).map((a) => <Chip key={a.id} a={a} onClick={() => onSelect(a)} compact />)}
                {items.length > 3 ? <p className="px-1 text-[10px] text-muted">+{items.length - 3} more</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const HOURS = Array.from({ length: 12 }).map((_, i) => 8 + i); // 8 AM – 7 PM

export function WeekView({ cursor, appointments, onSelect, single }: { cursor: Date; appointments: Appointment[]; onSelect: (a: Appointment) => void; single?: boolean }) {
  const days = single ? [cursor] : eachDayOfInterval({ start: startOfWeek(cursor, { weekStartsOn: 1 }), end: endOfWeek(cursor, { weekStartsOn: 1 }) });
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <div className="min-w-[760px]">
        <div className="grid border-b border-border" style={{ gridTemplateColumns: `56px repeat(${days.length}, 1fr)` }}>
          <div />
          {days.map((d) => (
            <div key={d.toISOString()} className="border-l border-border px-2 py-2 text-center">
              <p className="text-[11px] uppercase tracking-wider text-muted">{format(d, "EEE")}</p>
              <p className={cn("mx-auto mt-0.5 flex size-7 items-center justify-center rounded-full text-sm font-semibold", isToday(d) && "bg-primary text-white")}>{format(d, "d")}</p>
            </div>
          ))}
        </div>
        <div className="grid" style={{ gridTemplateColumns: `56px repeat(${days.length}, 1fr)` }}>
          <div>
            {HOURS.map((h) => <div key={h} className="h-16 border-b border-border pr-2 text-right font-mono text-[10px] text-muted">{format(new Date(2000, 0, 1, h), "h a")}</div>)}
          </div>
          {days.map((d) => (
            <div key={d.toISOString()} className="relative border-l border-border">
              {HOURS.map((h) => <div key={h} className="h-16 border-b border-border" />)}
              {appointments.filter((a) => isSameDay(new Date(a.startsAt), d)).map((a) => {
                const s = new Date(a.startsAt);
                const e = new Date(a.endsAt);
                const top = ((s.getHours() - 8) * 60 + s.getMinutes()) * (64 / 60);
                const height = Math.max(28, ((e.getTime() - s.getTime()) / 60000) * (64 / 60));
                if (s.getHours() < 8 || s.getHours() > 19) return null;
                return (
                  <div key={a.id} className="absolute inset-x-1" style={{ top, height }}>
                    <button type="button" onClick={() => onSelect(a)} className={cn("h-full w-full overflow-hidden rounded-md border px-1.5 py-1 text-left text-[11px] leading-tight hover:brightness-125", statusTone[a.status])}>
                      <span className="block truncate font-semibold">{a.customerName}</span>
                      <span className="block truncate opacity-80">{a.service}</span>
                      <span className="block font-mono opacity-70">{formatTime(a.startsAt)}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
