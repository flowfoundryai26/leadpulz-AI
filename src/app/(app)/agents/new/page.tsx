"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Building2, Briefcase, Car, Headset, Scissors, Smile, Sparkles, Target, Thermometer, UtensilsCrossed } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/badge";
import { INDUSTRY_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";

const icons: Record<string, React.ReactNode> = { Smile: <Smile />, Building2: <Building2 />, Thermometer: <Thermometer />, Scissors: <Scissors />, UtensilsCrossed: <UtensilsCrossed />, Briefcase: <Briefcase />, Car: <Car />, Headset: <Headset />, Target: <Target />, Sparkles: <Sparkles /> };

export default function NewAgentPage() {
  const router = useRouter();
  const { data: templates, loading } = useQuery(() => services.agents.getTemplates(), []);
  const [templateId, setTemplateId] = useState("tpl_dental");
  const [name, setName] = useState("Maya");
  const [company, setCompany] = useState("Apex Dental Care");
  const [pending, setPending] = useState(false);

  const create = async () => {
    const t = templates?.find((x) => x.id === templateId);
    if (!t) return;
    setPending(true);
    try {
      const agent = await services.agents.create({
        name: `${name} — ${t.name}`,
        role: t.name,
        company,
        goal: t.goal,
        description: t.description,
        type: t.type,
        systemPrompt: t.systemPrompt.replace(/{{company}}/g, company).replace(/{{agent}}/g, name),
      });
      toast.success("Agent created — configure it in the builder");
      router.push(`/agents/${agent.id}`);
    } catch (e) {
      toast.error((e as Error).message);
      setPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader breadcrumbs={[{ label: "AI Agents", href: "/agents" }, { label: "New agent" }]} title="Create a new AI agent" description="Start from a template and customise everything in the builder." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {templates?.map((t) => {
                const on = t.id === templateId;
                return (
                  <button key={t.id} type="button" onClick={() => setTemplateId(t.id)} aria-pressed={on} className={cn("flex items-start gap-3 rounded-2xl border p-4 text-left transition-all", on ? "border-primary/60 bg-primary-soft" : "border-border bg-surface hover:border-border-strong")}>
                    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4", on ? "bg-primary text-white" : "bg-surface-2 text-[#a3a3ff]")}>{icons[t.icon]}</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{t.name}</span>
                      <span className="mt-0.5 block text-xs text-muted">{t.description}</span>
                      <Badge variant="muted" className="mt-2">{INDUSTRY_LABEL[t.industry]}</Badge>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <aside className="h-fit rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-24">
          <p className="text-sm font-semibold">Agent details</p>
          <div className="mt-4 space-y-4">
            <Field label="Agent name" hint="The name your agent introduces itself with.">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Company">
              <Input value={company} onChange={(e) => setCompany(e.target.value)} />
            </Field>
          </div>
          <Button className="mt-6 w-full" onClick={create} loading={pending} disabled={!name || !company}>
            Continue to builder <ArrowRight />
          </Button>
        </aside>
      </div>
    </div>
  );
}
