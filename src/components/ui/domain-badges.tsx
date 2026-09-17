import { Badge } from "./badge";
import { cn } from "@/lib/utils";
import { LEAD_STAGE_LABEL } from "@/lib/constants";
import type { AgentStatus, AppointmentStatus, CallOutcome, CallStatus, CampaignStatus, KnowledgeStatus, LeadQuality, LeadStage, Sentiment } from "@/types";

export function AgentStatusBadge({ status }: { status: AgentStatus }) {
  if (status === "active") return <Badge variant="success" dot pulse>Active</Badge>;
  if (status === "paused") return <Badge variant="warning" dot>Paused</Badge>;
  return <Badge variant="muted" dot>Draft</Badge>;
}

export function SentimentBadge({ sentiment, compact }: { sentiment: Sentiment; compact?: boolean }) {
  const map = { positive: ["success", "Positive"], neutral: ["default", "Neutral"], negative: ["danger", "Negative"] } as const;
  const [variant, label] = map[sentiment];
  return (
    <Badge variant={variant} dot>
      {compact ? null : label}
    </Badge>
  );
}

export function OutcomeBadge({ outcome, status }: { outcome: CallOutcome; status?: CallStatus }) {
  const map: Record<CallOutcome, { v: "success" | "primary" | "accent" | "warning" | "danger" | "default" | "muted"; l: string }> = {
    qualified: { v: "primary", l: "Qualified" },
    booked: { v: "success", l: "Booked" },
    transferred: { v: "accent", l: "Transferred" },
    answered_question: { v: "default", l: "Resolved" },
    not_interested: { v: "muted", l: "Not interested" },
    callback_requested: { v: "warning", l: "Callback" },
    voicemail: { v: "muted", l: "Voicemail" },
    missed: { v: "danger", l: "Missed" },
    failed: { v: "danger", l: "Failed" },
    in_progress: { v: "accent", l: "In progress" },
  };
  const m = map[outcome];
  return <Badge variant={m.v} dot pulse={status === "in_progress"}>{m.l}</Badge>;
}

export function LeadQualityBadge({ quality }: { quality: LeadQuality }) {
  const map = {
    hot: ["danger", "Hot Lead"],
    warm: ["warning", "Warm Lead"],
    cold: ["accent", "Cold Lead"],
    not_qualified: ["muted", "Not Qualified"],
  } as const;
  const [v, l] = map[quality];
  return <Badge variant={v}>{l}</Badge>;
}

export function LeadStageBadge({ stage }: { stage: LeadStage }) {
  const variant = {
    new: "accent",
    contacted: "default",
    qualified: "primary",
    appointment_booked: "warning",
    proposal_sent: "warning",
    won: "success",
    lost: "danger",
  }[stage] as "accent" | "default" | "primary" | "warning" | "success" | "danger";
  return <Badge variant={variant}>{LEAD_STAGE_LABEL[stage]}</Badge>;
}

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const map = {
    confirmed: ["success", "Confirmed"],
    pending: ["warning", "Pending"],
    completed: ["default", "Completed"],
    cancelled: ["muted", "Cancelled"],
    no_show: ["danger", "No-show"],
  } as const;
  const [v, l] = map[status];
  return <Badge variant={v} dot>{l}</Badge>;
}

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const map = {
    draft: ["muted", "Draft"],
    scheduled: ["accent", "Scheduled"],
    running: ["success", "Running"],
    paused: ["warning", "Paused"],
    completed: ["default", "Completed"],
  } as const;
  const [v, l] = map[status];
  return <Badge variant={v} dot pulse={status === "running"}>{l}</Badge>;
}

export function KnowledgeStatusBadge({ status }: { status: KnowledgeStatus }) {
  if (status === "ready") return <Badge variant="success" dot>Ready</Badge>;
  if (status === "processing") return <Badge variant="accent" dot pulse>Processing</Badge>;
  return <Badge variant="danger" dot>Error</Badge>;
}

export function ScorePill({ score, className }: { score: number; className?: string }) {
  const tone = score >= 75 ? "text-danger bg-danger-soft" : score >= 50 ? "text-warning bg-warning-soft" : score >= 25 ? "text-accent bg-accent-soft" : "text-muted bg-elevated";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums", tone, className)}>
      {score}
      <span className="h-1 w-8 overflow-hidden rounded-full bg-black/30">
        <span className="block h-full rounded-full bg-current" style={{ width: `${score}%` }} />
      </span>
    </span>
  );
}

export function DirectionBadge({ direction }: { direction: "inbound" | "outbound" }) {
  return direction === "inbound" ? <Badge variant="accent">Inbound</Badge> : <Badge variant="primary">Outbound</Badge>;
}
