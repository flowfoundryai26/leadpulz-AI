"use client";

import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import type { DateRangeKey } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/primitives";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form";
import { useState } from "react";

const ranges: Array<{ key: DateRangeKey; label: string }> = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
];

export function DateRangeSelector({ className }: { className?: string }) {
  const { dateRange, setDateRange } = useAppStore();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  return (
    <div className={cn("inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-border bg-background-subtle p-1", className)}>
      {ranges.map((r) => (
        <button
          key={r.key}
          type="button"
          onClick={() => setDateRange(r.key)}
          className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors", dateRange === r.key ? "bg-surface-2 text-foreground shadow-sm" : "text-muted hover:text-foreground")}
        >
          {r.label}
        </button>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors", dateRange === "custom" ? "bg-surface-2 text-foreground shadow-sm" : "text-muted hover:text-foreground")}
          >
            <CalendarDays className="size-3.5" /> Custom
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 space-y-3">
          <p className="text-sm font-medium">Custom range</p>
          <Field label="From">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="To">
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
          <Button size="sm" className="w-full" onClick={() => setDateRange("custom")} disabled={!from || !to}>
            Apply
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
