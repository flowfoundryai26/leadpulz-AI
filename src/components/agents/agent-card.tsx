"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BarChart3, Bot, Copy, MoreHorizontal, Pause, Pencil, Play, PhoneCall, Trash2, Languages, Phone } from "lucide-react";
import type { Agent } from "@/types";
import { services } from "@/services";
import { AGENT_TYPE_LABEL, LANGUAGE_LABEL } from "@/lib/constants";
import { formatPercent, timeAgo } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AgentStatusBadge } from "@/components/ui/domain-badges";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

export function AgentActionsMenu({ agent, onChange, align = "end" }: { agent: Agent; onChange: () => void; align?: "end" | "start" }) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggle = async () => {
    const next = agent.status === "active" ? "paused" : "active";
    await services.agents.setStatus(agent.id, next);
    toast.success(next === "active" ? `${agent.name.split(" — ")[0]} is now active` : `${agent.name.split(" — ")[0]} paused`);
    onChange();
  };
  const duplicate = async () => {
    const copy = await services.agents.duplicate(agent.id);
    toast.success("Agent duplicated", { action: { label: "Open", onClick: () => router.push(`/agents/${copy.id}`) } });
    onChange();
  };
  const remove = async () => {
    setDeleting(true);
    await services.agents.remove(agent.id);
    setDeleting(false);
    setConfirmDelete(false);
    toast.success("Agent deleted");
    onChange();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Agent actions" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="w-48" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem asChild>
            <Link href={`/agents/${agent.id}`}>
              <Pencil /> Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/agents/${agent.id}?tab=test`}>
              <PhoneCall /> Test
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={duplicate}>
            <Copy /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggle}>{agent.status === "active" ? <><Pause /> Pause</> : <><Play /> Activate</>}</DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/analytics?agent=${agent.id}`}>
              <BarChart3 /> Analytics
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onClick={() => setConfirmDelete(true)}>
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete {agent.name.split(" — ")[0]}?</DialogTitle>
            <DialogDescription>This will stop all calls to this agent immediately. Call history and leads are kept. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={remove} loading={deleting}>
              Delete agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AgentCard({ agent, onChange }: { agent: Agent; onChange: () => void }) {
  const router = useRouter();
  const [first, rest] = agent.name.split(" — ");
  return (
    <Card interactive className="flex flex-col p-5" onClick={() => router.push(`/agents/${agent.id}`)}>
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 to-accent/70 text-white shadow-glow">
          <Bot className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{first}</p>
          <p className="truncate text-xs text-muted">{rest ?? agent.role}</p>
        </div>
        <AgentActionsMenu agent={agent} onChange={onChange} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <AgentStatusBadge status={agent.status} />
        <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-foreground-secondary">{AGENT_TYPE_LABEL[agent.type]}</span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
        <Stat label="Phone number" value={agent.phoneNumber ?? "Not assigned"} icon={<Phone />} mono />
        <Stat label="Voice" value={`${agent.voice.voiceName} · ${agent.voice.accent}`} />
        <Stat label="Language" value={[agent.voice.language, ...agent.voice.additionalLanguages].map((l) => LANGUAGE_LABEL[l]).join(", ")} icon={<Languages />} />
        <Stat label="Calls today" value={String(agent.stats.callsToday)} />
        <Stat label="Conversion" value={formatPercent(agent.stats.conversionRate)} />
        <Stat label="Last active" value={agent.lastActiveAt ? timeAgo(agent.lastActiveAt) : "Never"} />
      </dl>
    </Card>
  );
}

function Stat({ label, value, icon, mono }: { label: string; value: string; icon?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd className={"flex items-center gap-1.5 truncate text-[13px] font-medium [&_svg]:size-3.5 [&_svg]:text-muted " + (mono ? "font-mono" : "")} suppressHydrationWarning>
        {icon}
        {value}
      </dd>
    </div>
  );
}
