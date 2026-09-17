"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Bot, Pause, Play, Save, Phone } from "lucide-react";
import type { Agent } from "@/types";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentStatusBadge } from "@/components/ui/domain-badges";
import { ErrorState, PageSkeleton } from "@/components/ui/states";
import { AgentActionsMenu } from "../agent-card";
import { AgentTab } from "./agent-tab";
import { PromptTab } from "./prompt-tab";
import { FlowBuilder } from "./flow-builder";
import { VoiceTab } from "./voice-tab";
import { BehaviorTab } from "./behavior-tab";
import { QualificationTab } from "./qualification-tab";
import { KnowledgeTab, TestTab } from "./knowledge-test-tabs";
import { Badge } from "@/components/ui/badge";

const tabs = ["agent", "prompt", "flow", "voice", "behavior", "qualification", "knowledge", "test"] as const;
type Tab = (typeof tabs)[number];

export function AgentBuilder({ agentId }: { agentId: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const initialTab = (params.get("tab") as Tab) ?? "agent";
  const { data, loading, error, refetch } = useQuery(() => services.agents.get(agentId), [agentId]);
  const [draft, setDraft] = useState<Agent | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>(tabs.includes(initialTab) ? initialTab : "agent");

  // Hydrate the editable draft when the agent loads — intentional.
   
  useEffect(() => {
    if (data) {
      setDraft(data);
      setDirty(false);
    }
  }, [data]);

  const patch = (p: Partial<Agent>) => {
    setDraft((d) => (d ? { ...d, ...p } : d));
    setDirty(true);
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await services.agents.update(draft.id, draft);
      toast.success("Agent saved", { description: `Version ${draft.version + 1} is now live.` });
      setDirty(false);
      refetch();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    if (!draft) return;
    const next = draft.status === "active" ? "paused" : "active";
    await services.agents.setStatus(draft.id, next);
    toast.success(next === "active" ? "Agent activated" : "Agent paused");
    refetch();
  };

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (loading || !draft) return <PageSkeleton />;
  if (data === null) return <ErrorState error={{ name: "ServiceError", message: "This agent doesn't exist or was deleted.", code: "not_found" } as never} onRetry={() => router.push("/agents")} />;

  const [first] = draft.name.split(" — ");

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "AI Agents", href: "/agents" }, { label: first }]}
        title={
          <span className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 to-accent/70 text-white">
              <Bot className="size-5" />
            </span>
            {draft.name}
            <AgentStatusBadge status={draft.status} />
            {dirty ? <Badge variant="warning">Unsaved changes</Badge> : null}
          </span>
        }
        description={
          <span className="flex items-center gap-2">
            {draft.role} · {draft.company}
            {draft.phoneNumber ? (
              <span className="inline-flex items-center gap-1 font-mono text-xs">
                <Phone className="size-3" /> {draft.phoneNumber}
              </span>
            ) : null}
          </span>
        }
        actions={
          <>
            <Button variant="secondary" onClick={toggleStatus}>
              {draft.status === "active" ? <><Pause /> Pause</> : <><Play /> Activate</>}
            </Button>
            <Button onClick={save} loading={saving} disabled={!dirty && !saving}>
              {!saving ? <Save /> : null} Save changes
            </Button>
            <AgentActionsMenu agent={draft} onChange={refetch} />
          </>
        }
      />
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList variant="underline" className="mb-2 overflow-x-auto">
          <TabsTrigger value="agent">Agent</TabsTrigger>
          <TabsTrigger value="prompt">System Prompt</TabsTrigger>
          <TabsTrigger value="flow">Conversation Flow</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="behavior">Call Behavior</TabsTrigger>
          <TabsTrigger value="qualification">Lead Qualification</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
        </TabsList>
        <TabsContent value="agent"><AgentTab agent={draft} onChange={patch} /></TabsContent>
        <TabsContent value="prompt"><PromptTab agent={draft} onChange={patch} /></TabsContent>
        <TabsContent value="flow"><FlowBuilder agentId={draft.id} /></TabsContent>
        <TabsContent value="voice"><VoiceTab agent={draft} onChange={patch} /></TabsContent>
        <TabsContent value="behavior"><BehaviorTab agent={draft} onChange={patch} /></TabsContent>
        <TabsContent value="qualification"><QualificationTab agent={draft} onChange={patch} /></TabsContent>
        <TabsContent value="knowledge"><KnowledgeTab agent={draft} onChange={patch} /></TabsContent>
        <TabsContent value="test"><TestTab agent={draft} /></TabsContent>
      </Tabs>
    </div>
  );
}
