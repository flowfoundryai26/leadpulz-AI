"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, BookOpen, Bot, Cloud, FileText, Globe, HelpCircle, Link2, MoreHorizontal, Plus, RefreshCw, ShoppingBag, Trash2, Code2, Database, FileType2, Search } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import type { KnowledgeDocument, KnowledgeSourceType } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/ui/data-table";
import { KnowledgeStatusBadge } from "@/components/ui/domain-badges";
import { Badge } from "@/components/ui/badge";
import { Checkbox, Tip } from "@/components/ui/primitives";
import { ErrorState, InlineAlert, EmptyState } from "@/components/ui/states";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field } from "@/components/ui/form";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

const sourceMeta: Record<KnowledgeSourceType, { icon: React.ReactNode; label: string }> = {
  website: { icon: <Globe />, label: "Website" },
  pdf: { icon: <FileText />, label: "PDF" },
  docx: { icon: <FileType2 />, label: "DOCX" },
  txt: { icon: <FileText />, label: "Text file" },
  faq: { icon: <HelpCircle />, label: "FAQs" },
  manual: { icon: <BookOpen />, label: "Manual" },
  url: { icon: <Link2 />, label: "URL" },
  notion: { icon: <Database />, label: "Notion" },
  google_drive: { icon: <Cloud />, label: "Google Drive" },
  shopify: { icon: <ShoppingBag />, label: "Shopify" },
  api: { icon: <Code2 />, label: "API" },
};

function AddKnowledgeDialog({ open, onOpenChange, onDone, bases }: { open: boolean; onOpenChange: (o: boolean) => void; onDone: () => void; bases: Array<{ id: string; name: string }> }) {
  const { data: agents } = useQuery(() => services.agents.list(), []);
  const [type, setType] = useState<KnowledgeSourceType>("website");
  const [baseId, setBaseId] = useState(bases[0]?.id ?? "kb_apex");
  const [ref, setRef] = useState("");
  const [title, setTitle] = useState("");
  const [agentIds, setAgentIds] = useState<string[]>(["agt_maya"]);
  const [pending, setPending] = useState(false);
  useEffect(() => { if (bases[0]) setBaseId(bases[0].id); }, [bases]);

  const submit = async () => {
    setPending(true);
    await services.knowledge.addSource({ baseId, sourceType: type, sourceRef: ref, title: title || ref, agentIds });
    setPending(false);
    toast.success("Source added — processing", { description: "It will be ready for agents in a few seconds." });
    onOpenChange(false);
    setRef(""); setTitle("");
    onDone();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader><DialogTitle>Add knowledge</DialogTitle><DialogDescription>Teach your agents about your company. Content is chunked, embedded and made searchable.</DialogDescription></DialogHeader>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {(Object.keys(sourceMeta) as KnowledgeSourceType[]).map((k) => (
            <button key={k} type="button" onClick={() => setType(k)} className={cn("flex flex-col items-center gap-1.5 rounded-xl border p-3 text-[11px] [&_svg]:size-4", type === k ? "border-primary/60 bg-primary-soft text-foreground" : "border-border text-muted hover:border-border-strong")}>{sourceMeta[k].icon}{sourceMeta[k].label}</button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Knowledge base"><SimpleSelect value={baseId} onValueChange={setBaseId} options={bases.map((b) => ({ value: b.id, label: b.name }))} /></Field>
          <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional display name" /></Field>
          {type === "pdf" || type === "docx" || type === "txt" ? (
            <Field label="File" className="sm:col-span-2">
              <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-border-strong px-4 py-6 text-sm text-muted hover:border-primary/60">
                {ref || `Choose a .${type} file`}
                <input type="file" accept={`.${type}`} className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setRef(f.name); if (!title) setTitle(f.name); } }} />
              </label>
            </Field>
          ) : type === "faq" || type === "manual" ? (
            <Field label={type === "faq" ? "Questions & answers" : "Content"} className="sm:col-span-2"><Textarea value={ref} onChange={(e) => setRef(e.target.value)} className="min-h-[120px]" placeholder={type === "faq" ? "Q: Do you accept insurance?\nA: We accept all major insurers…" : "Paste text here"} /></Field>
          ) : type === "notion" || type === "google_drive" || type === "shopify" ? (
            <Field label="Connection" className="sm:col-span-2"><InlineAlert tone="info">Connect {sourceMeta[type].label} from the Integrations page to sync automatically. For now, paste a share link below.</InlineAlert><Input className="mt-2" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Share link" /></Field>
          ) : (
            <Field label={type === "api" ? "Endpoint" : "URL"} className="sm:col-span-2"><Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="https://" leftIcon={<Globe />} /></Field>
          )}
          <Field label="Agent access" className="sm:col-span-2">
            <div className="flex flex-wrap gap-2">
              {agents?.map((a) => {
                const on = agentIds.includes(a.id);
                return <label key={a.id} className={cn("flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs", on ? "border-primary/60 bg-primary-soft" : "border-border")}><Checkbox checked={on} onCheckedChange={(v) => setAgentIds((ids) => (v ? [...ids, a.id] : ids.filter((x) => x !== a.id)))} />{a.name.split(" — ")[0]}</label>;
              })}
            </div>
          </Field>
        </div>
        <DialogFooter><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} loading={pending} disabled={!ref}>Add source</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function KnowledgePage() {
  const bases = useQuery(() => services.knowledge.listBases(), []);
  const docs = useQuery(() => services.knowledge.listDocuments(), []);
  const { data: agents } = useQuery(() => services.agents.list(), []);
  const [base, setBase] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [assign, setAssign] = useState<KnowledgeDocument | null>(null);

  // Poll while anything is processing so status flips to Ready.
  // Poll while sources are processing so status flips to Ready — intentional.
   
  useEffect(() => {
    if (!docs.data?.some((d) => d.status === "processing")) return;
    const t = setInterval(() => docs.refetch(), 2500);
    return () => clearInterval(t);
  }, [docs.data, docs]);

  const rows = useMemo(() => (docs.data ?? []).filter((d) => (base === "all" || d.knowledgeBaseId === base) && (!q || d.title.toLowerCase().includes(q.toLowerCase()))), [docs.data, base, q]);
  const counts = useMemo(() => ({ ready: rows.filter((d) => d.status === "ready").length, processing: rows.filter((d) => d.status === "processing").length, error: rows.filter((d) => d.status === "error").length, chunks: rows.reduce((a, b) => a + b.chunks, 0) }), [rows]);

  const columns: Column<KnowledgeDocument>[] = [
    { key: "doc", header: "Document", sortValue: (d) => d.title, cell: (d) => <div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-surface-2 text-muted [&_svg]:size-4">{sourceMeta[d.sourceType].icon}</span><div className="min-w-0"><p className="truncate font-medium">{d.title}</p><p className="truncate text-xs text-muted">{d.chunks} chunks{d.sizeKb ? ` · ${(d.sizeKb / 1024).toFixed(1)} MB` : ""}</p></div></div> },
    { key: "source", header: "Source", cell: (d) => <span className="text-foreground-secondary">{sourceMeta[d.sourceType].label}</span> },
    { key: "kb", header: "Knowledge base", cell: (d) => bases.data?.find((b) => b.id === d.knowledgeBaseId)?.name ?? "—" },
    { key: "agents", header: "Agent access", cell: (d) => <span className="flex flex-wrap gap-1">{d.agentIds.length ? d.agentIds.map((id) => <Badge key={id} variant="muted"><Bot className="size-3" />{agents?.find((a) => a.id === id)?.name.split(" — ")[0] ?? id}</Badge>) : <span className="text-xs text-faint">None</span>}</span> },
    { key: "updated", header: "Last updated", sortValue: (d) => d.lastUpdatedAt, cell: (d) => <span className="whitespace-nowrap text-xs text-muted" suppressHydrationWarning>{formatRelative(d.lastUpdatedAt)}</span> },
    { key: "status", header: "Status", sortValue: (d) => d.status, cell: (d) => <span className="flex items-center gap-2"><KnowledgeStatusBadge status={d.status} />{d.errorMessage ? <Tip content={d.errorMessage}><AlertTriangle className="size-3.5 text-danger" /></Tip> : null}</span> },
    { key: "actions", header: "", className: "text-right", cell: (d) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="Actions"><MoreHorizontal /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setAssign(d)}><Bot /> Assign to agents</DropdownMenuItem>
          <DropdownMenuItem onClick={async () => { await services.knowledge.retry(d.id); toast.success("Re-indexing"); docs.refetch(); }}><RefreshCw /> {d.status === "error" ? "Retry" : "Re-sync"}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onClick={async () => { await services.knowledge.remove(d.id); toast.success("Source removed"); docs.refetch(); }}><Trash2 /> Remove</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) },
  ];

  return (
    <div>
      <PageHeader title="Knowledge" description="Teach your AI agents about your company — services, pricing, policies and FAQs." actions={<Button onClick={() => setOpen(true)}><Plus /> Add Knowledge</Button>}>
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="Search documents…" value={q} onChange={(e) => setQ(e.target.value)} leftIcon={<Search />} className="w-full sm:w-64" />
          <SimpleSelect value={base} onValueChange={setBase} className="w-full sm:w-52" options={[{ value: "all", label: "All knowledge bases" }, ...(bases.data ?? []).map((b) => ({ value: b.id, label: b.name }))]} />
          <div className="flex flex-wrap gap-2 text-xs sm:ml-auto">
            <Badge variant="success" dot>{counts.ready} ready</Badge>
            {counts.processing ? <Badge variant="accent" dot pulse>{counts.processing} processing</Badge> : null}
            {counts.error ? <Badge variant="danger" dot>{counts.error} error</Badge> : null}
            <Badge variant="muted">{counts.chunks} chunks indexed</Badge>
          </div>
        </div>
      </PageHeader>

      {counts.error ? <InlineAlert tone="danger" title="A source failed to process" className="mb-4" action={<Button size="xs" variant="secondary" onClick={() => setBase("all")}>Review</Button>}>Agents will answer from the last successful index. Retry the source or reconnect the integration.</InlineAlert> : null}

      {docs.error ? <ErrorState error={docs.error} onRetry={docs.refetch} /> : !docs.loading && docs.data?.length === 0 ? (
        <EmptyState icon={<BookOpen />} title="No knowledge yet" description="Add your website, documents or FAQs so agents can answer accurately." action={<Button onClick={() => setOpen(true)}><Plus /> Add Knowledge</Button>} />
      ) : (
        <DataTable columns={columns} rows={rows} rowKey={(d) => d.id} loading={docs.loading} emptyTitle="No documents match" />
      )}

      <AddKnowledgeDialog open={open} onOpenChange={setOpen} onDone={docs.refetch} bases={bases.data ?? []} />

      <Dialog open={!!assign} onOpenChange={(o) => !o && setAssign(null)}>
        {assign ? (
          <DialogContent size="sm">
            <DialogHeader><DialogTitle>Agent access</DialogTitle><DialogDescription>{assign.title}</DialogDescription></DialogHeader>
            <div className="space-y-2">
              {agents?.map((a) => {
                const on = assign.agentIds.includes(a.id);
                return <label key={a.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm"><Checkbox checked={on} onCheckedChange={(v) => setAssign({ ...assign, agentIds: v ? [...assign.agentIds, a.id] : assign.agentIds.filter((x) => x !== a.id) })} />{a.name}</label>;
              })}
            </div>
            <DialogFooter><Button variant="secondary" onClick={() => setAssign(null)}>Cancel</Button><Button onClick={async () => { await services.knowledge.assignAgents(assign.id, assign.agentIds); toast.success("Access updated"); setAssign(null); docs.refetch(); }}>Save</Button></DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
