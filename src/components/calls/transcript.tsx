"use client";

import { Bot, User } from "lucide-react";
import type { TranscriptTurn } from "@/types";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/format";
import { EmptyState } from "@/components/ui/states";

const highlightTone: Record<NonNullable<TranscriptTurn["highlights"]>[number]["kind"], string> = {
  intent: "bg-primary/25 text-[#d6d6ff] ring-primary/40",
  budget: "bg-success/20 text-success ring-success/40",
  timeline: "bg-warning/20 text-warning ring-warning/40",
  contact: "bg-accent/20 text-accent ring-accent/40",
  objection: "bg-danger/20 text-danger ring-danger/40",
  location: "bg-chart-4/25 text-[#d9b8ff] ring-chart-4/40",
};

function renderText(t: TranscriptTurn) {
  if (!t.highlights?.length) return t.text;
  let rest = t.text;
  const out: React.ReactNode[] = [];
  t.highlights.forEach((h, i) => {
    const idx = rest.indexOf(h.text);
    if (idx === -1) return;
    out.push(rest.slice(0, idx));
    out.push(
      <mark key={i} className={cn("rounded px-1 py-0.5 ring-1 ring-inset", highlightTone[h.kind])} title={h.kind}>
        {h.text}
      </mark>,
    );
    rest = rest.slice(idx + h.text.length);
  });
  out.push(rest);
  return out;
}

export function Transcript({ turns, agentName = "AI", currentTime, onSeek, live, className }: { turns: TranscriptTurn[]; agentName?: string; currentTime?: number; onSeek?: (t: number) => void; live?: boolean; className?: string }) {
  if (!turns.length) return <EmptyState compact title="No transcript available" description="Transcripts are generated automatically for completed calls." />;
  return (
    <div className={cn("space-y-4", className)}>
      {turns.map((t, i) => {
        const next = turns[i + 1];
        const active = currentTime !== undefined && currentTime >= t.offsetSec && (!next || currentTime < next.offsetSec);
        const ai = t.speaker === "ai";
        return (
          <div key={t.id} className={cn("flex gap-3 animate-fade-in", !ai && "flex-row-reverse")}>
            <span className={cn("mt-1 flex size-7 shrink-0 items-center justify-center rounded-full", ai ? "bg-primary-soft text-[#a3a3ff]" : "bg-surface-2 text-foreground-secondary")}>{ai ? <Bot className="size-3.5" /> : <User className="size-3.5" />}</span>
            <div className={cn("max-w-[78%]", !ai && "text-right")}>
              <div className={cn("mb-1 flex items-center gap-2 text-[11px] text-muted", !ai && "justify-end")}>
                <span className="font-semibold uppercase tracking-wider">{ai ? agentName : "Customer"}</span>
                {onSeek ? (
                  <button type="button" onClick={() => onSeek(t.offsetSec)} className="font-mono tabular-nums hover:text-foreground">
                    {formatDuration(t.offsetSec)}
                  </button>
                ) : (
                  <span className="font-mono tabular-nums">{formatDuration(t.offsetSec)}</span>
                )}
              </div>
              <div className={cn("inline-block rounded-2xl px-3.5 py-2 text-left text-sm leading-relaxed transition-shadow", ai ? "rounded-tl-sm bg-surface-2 text-foreground" : "rounded-tr-sm bg-primary/90 text-white", active && "ring-2 ring-accent/60")}>
                {renderText(t)}
              </div>
            </div>
          </div>
        );
      })}
      {live ? (
        <div className="flex gap-3">
          <span className="mt-1 flex size-7 items-center justify-center rounded-full bg-primary-soft text-[#a3a3ff]"><Bot className="size-3.5" /></span>
          <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-surface-2 px-3.5 py-3">
            {[0, 1, 2].map((i) => <span key={i} className="size-1.5 rounded-full bg-muted animate-pulse-soft" style={{ animationDelay: `${i * 0.2}s` }} />)}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function HighlightLegend() {
  return (
    <div className="flex flex-wrap gap-2 text-[10px]">
      {(Object.keys(highlightTone) as Array<keyof typeof highlightTone>).map((k) => (
        <span key={k} className={cn("rounded px-1.5 py-0.5 capitalize ring-1 ring-inset", highlightTone[k])}>{k}</span>
      ))}
    </div>
  );
}
