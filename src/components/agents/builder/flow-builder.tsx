"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Handle,
  Position,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Play,
  MessageSquare,
  HelpCircle,
  Brain,
  GitBranch,
  Globe,
  Calendar,
  PhoneForwarded,
  MessageCircle,
  Mail,
  Database,
  Webhook,
  Timer,
  PhoneOff,
  Plus,
  Save,
  Trash2,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import type { ConversationFlow, FlowNodeType } from "@/types";
import { services } from "@/services";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/form";
import { cn, uid } from "@/lib/utils";
import { Spinner } from "@/components/ui/primitives";

const nodeMeta: Record<FlowNodeType, { label: string; icon: React.ReactNode; tone: string }> = {
  start: { label: "Start Call", icon: <Play />, tone: "text-success bg-success-soft border-success/40" },
  speak: { label: "Speak", icon: <MessageSquare />, tone: "text-[#a3a3ff] bg-primary-soft border-primary/40" },
  ask_question: { label: "Ask Question", icon: <HelpCircle />, tone: "text-[#a3a3ff] bg-primary-soft border-primary/40" },
  identify_intent: { label: "Identify Intent", icon: <Brain />, tone: "text-accent bg-accent-soft border-accent/40" },
  condition: { label: "Condition", icon: <GitBranch />, tone: "text-warning bg-warning-soft border-warning/40" },
  api_call: { label: "API Call", icon: <Globe />, tone: "text-foreground-secondary bg-surface-2 border-border-strong" },
  book_appointment: { label: "Book Appointment", icon: <Calendar />, tone: "text-success bg-success-soft border-success/40" },
  transfer_call: { label: "Transfer Call", icon: <PhoneForwarded />, tone: "text-warning bg-warning-soft border-warning/40" },
  send_sms: { label: "Send SMS", icon: <Smartphone />, tone: "text-accent bg-accent-soft border-accent/40" },
  send_whatsapp: { label: "Send WhatsApp", icon: <MessageCircle />, tone: "text-success bg-success-soft border-success/40" },
  send_email: { label: "Send Email", icon: <Mail />, tone: "text-accent bg-accent-soft border-accent/40" },
  crm_action: { label: "CRM Action", icon: <Database />, tone: "text-foreground-secondary bg-surface-2 border-border-strong" },
  webhook: { label: "Webhook", icon: <Webhook />, tone: "text-foreground-secondary bg-surface-2 border-border-strong" },
  wait: { label: "Wait", icon: <Timer />, tone: "text-muted bg-surface-2 border-border-strong" },
  end_call: { label: "End Call", icon: <PhoneOff />, tone: "text-danger bg-danger-soft border-danger/40" },
};

type FlowNodeData = { type: FlowNodeType; label: string; description?: string };
type LPNode = Node<FlowNodeData, "lp">;

function LPNodeComponent({ data, selected }: NodeProps<LPNode>) {
  const meta = nodeMeta[data.type];
  const isStart = data.type === "start";
  const isEnd = data.type === "end_call";
  return (
    <div className={cn("w-[220px] rounded-xl border bg-surface shadow-card transition-shadow", selected ? "border-primary ring-2 ring-primary/30" : "border-border")}>
      {!isStart ? <Handle type="target" position={Position.Top} /> : null}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-md border [&_svg]:size-3.5", meta.tone)}>{meta.icon}</span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-foreground">{data.label}</p>
          <p className="truncate text-[11px] text-muted">{data.description ?? meta.label}</p>
        </div>
      </div>
      {data.type === "condition" ? (
        <div className="flex border-t border-border text-[10px] text-muted">
          <span className="flex-1 border-r border-border px-2 py-1 text-center">No</span>
          <span className="flex-1 px-2 py-1 text-center">Yes</span>
        </div>
      ) : null}
      {!isEnd ? <Handle type="source" position={Position.Bottom} /> : null}
    </div>
  );
}

const nodeTypes = { lp: LPNodeComponent };

function toRF(flow: ConversationFlow): { nodes: LPNode[]; edges: Edge[] } {
  return {
    nodes: flow.nodes.map((n) => ({ id: n.id, type: "lp", position: n.position, data: { type: n.type, label: n.label, description: n.description } })),
    edges: flow.edges.map((e) => ({ id: e.id, source: e.source, target: e.target, label: e.label, labelStyle: { fill: "var(--lp-muted)", fontSize: 10 }, labelBgStyle: { fill: "var(--lp-surface)" }, animated: false })),
  };
}

function fromRF(nodes: LPNode[], edges: Edge[]): ConversationFlow {
  return {
    nodes: nodes.map((n) => ({ id: n.id, type: n.data.type, label: n.data.label, description: n.data.description, position: n.position })),
    edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, label: typeof e.label === "string" ? e.label : undefined })),
  };
}

export function FlowBuilder({ agentId }: { agentId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<LPNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    services.agents.getFlow(agentId).then((f) => {
      const rf = toRF(f);
      setNodes(rf.nodes);
      setEdges(rf.edges);
      setLoading(false);
    });
  }, [agentId, setNodes, setEdges]);

  const onConnect = useCallback((c: Connection) => setEdges((eds) => addEdge({ ...c, id: uid("e") }, eds)), [setEdges]);

  const addNode = (type: FlowNodeType) => {
    const last = nodes[nodes.length - 1];
    const node: LPNode = {
      id: uid("n"),
      type: "lp",
      position: { x: (last?.position.x ?? 0) + 40, y: (last?.position.y ?? 0) + 120 },
      data: { type, label: nodeMeta[type].label },
    };
    setNodes((ns) => [...ns, node]);
    setSelectedId(node.id);
  };

  const selected = useMemo(() => nodes.find((n) => n.id === selectedId), [nodes, selectedId]);
  const updateSelected = (patch: Partial<FlowNodeData>) => setNodes((ns) => ns.map((n) => (n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n)));
  const deleteSelected = () => {
    if (!selectedId) return;
    setNodes((ns) => ns.filter((n) => n.id !== selectedId));
    setEdges((es) => es.filter((e) => e.source !== selectedId && e.target !== selectedId));
    setSelectedId(null);
  };

  const save = async () => {
    setSaving(true);
    await services.agents.saveFlow(agentId, fromRF(nodes, edges));
    setSaving(false);
    toast.success("Conversation flow saved");
  };

  if (loading) {
    return (
      <div className="flex h-[60dvh] min-h-[420px] items-center justify-center rounded-2xl border border-border bg-surface lg:h-[640px]">
        <Spinner size={24} />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[200px_1fr_280px]">
      <aside className="rounded-2xl border border-border bg-surface p-3">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Node types</p>
        <div className="mt-2 space-y-1">
          {(Object.keys(nodeMeta) as FlowNodeType[])
            .filter((t) => t !== "start")
            .map((t) => (
              <button key={t} type="button" onClick={() => addNode(t)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] text-foreground-secondary hover:bg-surface-2 hover:text-foreground">
                <span className={cn("flex size-6 items-center justify-center rounded-md border [&_svg]:size-3", nodeMeta[t].tone)}>{nodeMeta[t].icon}</span>
                {nodeMeta[t].label}
                <Plus className="ml-auto size-3 text-faint" />
              </button>
            ))}
        </div>
      </aside>

      <div className="relative h-[60dvh] min-h-[420px] overflow-hidden rounded-2xl border border-border bg-background-subtle lg:h-[640px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, n) => setSelectedId(n.id)}
          onPaneClick={() => setSelectedId(null)}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          colorMode="dark"
          defaultEdgeOptions={{ type: "smoothstep", style: { stroke: "var(--lp-border-strong)" } }}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="rgba(125,134,156,0.25)" />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable nodeColor={() => "var(--lp-primary)"} maskColor="rgba(7,10,18,0.6)" style={{ background: "var(--lp-surface)" }} />
        </ReactFlow>
        <div className="absolute right-3 top-3 flex gap-2">
          <Button size="sm" onClick={save} loading={saving}>
            {!saving ? <Save /> : null} Save flow
          </Button>
        </div>
      </div>

      <aside className="rounded-2xl border border-border bg-surface p-4">
        {selected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={cn("flex size-7 items-center justify-center rounded-md border [&_svg]:size-3.5", nodeMeta[selected.data.type].tone)}>{nodeMeta[selected.data.type].icon}</span>
              <p className="text-sm font-semibold">{nodeMeta[selected.data.type].label}</p>
            </div>
            <Field label="Label">
              <Input value={selected.data.label} onChange={(e) => updateSelected({ label: e.target.value })} />
            </Field>
            <Field label={selected.data.type === "speak" || selected.data.type === "ask_question" ? "Message" : selected.data.type === "condition" ? "Condition expression" : "Configuration"}>
              <Textarea value={selected.data.description ?? ""} onChange={(e) => updateSelected({ description: e.target.value })} className="min-h-[110px]" placeholder={selected.data.type === "condition" ? "lead_score >= 50" : "Describe what this step does"} />
            </Field>
            {selected.data.type === "book_appointment" ? (
              <Field label="Calendar">
                <Input defaultValue="Google Calendar — Dr. Kavya Nair" />
              </Field>
            ) : null}
            {selected.data.type === "transfer_call" ? (
              <Field label="Transfer to">
                <Input defaultValue="+91 40 4567 8900" />
              </Field>
            ) : null}
            {selected.data.type === "webhook" || selected.data.type === "api_call" ? (
              <Field label="URL">
                <Input placeholder="https://" />
              </Field>
            ) : null}
            {selected.data.type !== "start" ? (
              <Button variant="danger-ghost" size="sm" onClick={deleteSelected}>
                <Trash2 /> Remove node
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="text-sm text-muted">
            <p className="font-medium text-foreground">Conversation flow</p>
            <p className="mt-1">Select a node to configure it, drag to rearrange, and connect handles to define the path a call can take.</p>
            <ul className="mt-4 space-y-1.5 text-xs">
              <li>· {nodes.length} nodes</li>
              <li>· {edges.length} connections</li>
              <li>· {nodes.filter((n) => n.data.type === "condition").length} branches</li>
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
