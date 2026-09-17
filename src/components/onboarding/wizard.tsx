"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  FileText,
  Globe,
  Headphones,
  Link2,
  Mic,
  Phone,
  PhoneCall,
  Play,
  Rocket,
  Sparkles,
  Upload,
  Volume2,
  MessageSquareText,
  Building2,
  Briefcase,
  Car,
  Scissors,
  Smile,
  Target,
  Thermometer,
  UtensilsCrossed,
  Headset,
  MonitorSmartphone,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { services } from "@/services";
import { useAppStore } from "@/store/app-store";
import { ACCENTS, AGENT_PURPOSES, COUNTRIES, EMPLOYEE_RANGES, INDUSTRIES, LANGUAGES, TIMEZONES, TONES } from "@/lib/constants";
import { voiceLibrary } from "@/data/mock/agents";
import type { AgentTemplate, LanguageCode, Tone, TranscriptTurn } from "@/types";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/form";
import { SimpleSelect } from "@/components/ui/select";
import { Slider, Progress, RadioGroup, RadioGroupItem, Spinner } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/layout/logo";
import { Waveform } from "@/components/dashboard/live-activity";
import { formatDuration } from "@/lib/format";

const steps = ["Welcome", "Business", "Purpose", "Template", "Voice", "Knowledge", "Phone", "Test", "Launch"];

const templateIcons: Record<string, React.ReactNode> = {
  Smile: <Smile />,
  Building2: <Building2 />,
  Thermometer: <Thermometer />,
  Scissors: <Scissors />,
  UtensilsCrossed: <UtensilsCrossed />,
  Briefcase: <Briefcase />,
  Car: <Car />,
  Headset: <Headset />,
  Target: <Target />,
  Sparkles: <Sparkles />,
};

interface KnowledgeItem {
  id: string;
  label: string;
  kind: string;
  status: "processing" | "ready";
}

export function OnboardingWizard() {
  const router = useRouter();
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);
  const [step, setStep] = useState(0);

  // Step data
  const [business, setBusiness] = useState({ name: "Apex Dental Care", website: "https://apexdentalcare.in", industry: "dental", country: "India", timezone: "Asia/Kolkata", phone: "+91 40 4567 8900", employees: "6–20" });
  const [purposes, setPurposes] = useState<string[]>(["answer_calls", "qualify_leads", "book_appointments"]);
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [templateId, setTemplateId] = useState("tpl_dental");
  const [voice, setVoice] = useState({ voiceId: "lp_maya_in_f", gender: "female", accent: "Indian", speed: 1, language: "en" as LanguageCode, tone: "friendly" as Tone });
  const [previewing, setPreviewing] = useState(false);
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [kbInput, setKbInput] = useState({ url: "", faqQ: "", faqA: "", text: "" });
  const [phoneChoice, setPhoneChoice] = useState<"buy" | "twilio" | "existing" | "skip">("buy");
  const [testing, setTesting] = useState<"idle" | "connecting" | "live" | "ended">("idle");
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [launching, setLaunching] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);

  useEffect(() => {
    services.agents.getTemplates().then(setTemplates);
  }, []);

  const template = useMemo(() => templates.find((t) => t.id === templateId), [templates, templateId]);
  const agentName = voiceLibrary.find((v) => v.id === voice.voiceId)?.name ?? "Maya";

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const addKnowledge = (label: string, kind: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setKnowledge((k) => [...k, { id, label, kind, status: "processing" }]);
    setTimeout(() => setKnowledge((k) => k.map((x) => (x.id === id ? { ...x, status: "ready" } : x))), 2500 + Math.random() * 2000);
  };

  const previewVoice = async () => {
    setPreviewing(true);
    await services.agents.previewVoice(voice.voiceId, `Hi, thank you for calling ${business.name}. I'm ${agentName}. How can I help you today?`);
    setPreviewing(false);
    toast.success("Voice preview played", { description: `${agentName} · ${voice.accent} · ${TONES.find((t) => t.value === voice.tone)?.label}` });
  };

  // Simulated test conversation
  const startTest = (mode: "call" | "browser") => {
    setTesting("connecting");
    setTranscript([]);
    setElapsed(0);
    const script: TranscriptTurn[] = [
      { id: "1", speaker: "ai", offsetSec: 0, text: `Hi, thank you for calling ${business.name}. I'm ${agentName}, the virtual assistant. How can I help you today?` },
      { id: "2", speaker: "customer", offsetSec: 5, text: mode === "call" ? "Hi, I'd like to know if you offer teeth whitening and how much it costs." : "Hello, do you have any appointments available this week?" },
      { id: "3", speaker: "ai", offsetSec: 10, text: mode === "call" ? "Yes, we do. In-clinic laser whitening is ₹12,000 and takes about an hour. Would you like me to check availability for a session?" : "We do — Dr. Kavya has openings on Thursday at 4 PM and Friday at 11 AM. Which works better for you?" },
      { id: "4", speaker: "customer", offsetSec: 17, text: mode === "call" ? "Yes please, sometime this weekend." : "Friday at 11 sounds good." },
      { id: "5", speaker: "ai", offsetSec: 22, text: mode === "call" ? "Saturday at 11 AM or 3 PM are open. May I have your name and number to hold a slot?" : "Great, I've booked Friday at 11 AM. May I have your name and phone number to confirm?" },
    ];
    setTimeout(() => setTesting("live"), 1200);
    script.forEach((turn, i) => setTimeout(() => setTranscript((t) => [...t, turn]), 1500 + i * 2600));
    setTimeout(() => setTesting("ended"), 1500 + script.length * 2600 + 800);
  };

  useEffect(() => {
    if (testing !== "live") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [testing]);

  const launch = async () => {
    setLaunching(true);
    try {
      const agent = await services.agents.create({
        name: `${agentName} — ${template?.name ?? "AI Agent"}`,
        role: template?.name ?? "AI Agent",
        company: business.name,
        goal: template?.goal,
        description: template?.description,
        type: template?.type,
        systemPrompt: template?.systemPrompt.replace(/{{company}}/g, business.name).replace(/{{agent}}/g, agentName),
      });
      await services.agents.setStatus(agent.id, "active");
      setAgentId(agent.id);
      setOnboardingComplete(true);
      next();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLaunching(false);
    }
  };

  const canContinue = () => {
    if (step === 1) return business.name.length > 1 && !!business.industry;
    if (step === 2) return purposes.length > 0;
    if (step === 3) return !!templateId;
    return true;
  };

  return (
    <div className="min-h-screen lp-ambient">
      <header className="flex h-16 items-center justify-between gap-4 border-b border-border/60 px-4 sm:px-6">
        <Logo />
        <div className="hidden items-center gap-1 xl:flex">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors", i === step ? "bg-primary-soft text-[#c7c7ff]" : i < step ? "text-success" : "text-faint")}
              >
                {i < step ? <Check className="size-3" /> : <span className="tabular-nums">{i + 1}</span>}
                {s}
              </button>
              {i < steps.length - 1 ? <span className="mx-0.5 h-px w-3 bg-border" /> : null}
            </div>
          ))}
        </div>
        <Link href="/dashboard" className="shrink-0 text-xs text-muted hover:text-foreground">
          Skip setup
        </Link>
      </header>
      <div className="px-4 pt-4 sm:px-6 xl:hidden">
        <Progress value={((step + 1) / steps.length) * 100} />
        <p className="mt-1.5 text-[11px] text-muted">
          Step {step + 1} of {steps.length} · {steps[step]}
        </p>
      </div>

      <main className="mx-auto w-full max-w-4xl px-4 py-8 animate-slide-up sm:px-6 sm:py-10" key={step}>
        {/* Step 1 — Welcome */}
        {step === 0 ? (
          <div className="text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow">
              <Bot className="size-8 text-white" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Build your first AI Revenue Agent</h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-foreground-secondary">
              LeadPulz can handle your customer conversations automatically — answering calls, qualifying leads, booking appointments and following up — so no opportunity is ever missed. This takes about 5 minutes.
            </p>
            <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                { icon: <PhoneCall />, title: "Answers 24/7", text: "Every call picked up in under a second." },
                { icon: <ListChecks />, title: "Qualifies & books", text: "Scores intent and fills your calendar." },
                { icon: <MessageSquareText />, title: "Follows up", text: "WhatsApp, SMS and email — automatically." },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl border border-border bg-surface/70 p-4 text-left backdrop-blur">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-[#a3a3ff] [&_svg]:size-4">{f.icon}</span>
                  <p className="mt-3 text-sm font-semibold">{f.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{f.text}</p>
                </div>
              ))}
            </div>
            <Button size="lg" className="mt-10" onClick={next}>
              Get Started <ArrowRight />
            </Button>
          </div>
        ) : null}

        {/* Step 2 — Business info */}
        {step === 1 ? (
          <StepFrame title="Tell us about your business" description="We'll use this to personalise your agent's knowledge and greeting.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Business name" required>
                <Input value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} />
              </Field>
              <Field label="Website">
                <Input value={business.website} onChange={(e) => setBusiness({ ...business, website: e.target.value })} placeholder="https://" leftIcon={<Globe />} />
              </Field>
              <Field label="Industry" required>
                <SimpleSelect value={business.industry} onValueChange={(v) => setBusiness({ ...business, industry: v })} options={INDUSTRIES} />
              </Field>
              <Field label="Country">
                <SimpleSelect value={business.country} onValueChange={(v) => setBusiness({ ...business, country: v })} options={COUNTRIES.map((c) => ({ value: c, label: c }))} />
              </Field>
              <Field label="Timezone">
                <SimpleSelect value={business.timezone} onValueChange={(v) => setBusiness({ ...business, timezone: v })} options={TIMEZONES.map((t) => ({ value: t, label: t }))} />
              </Field>
              <Field label="Business phone">
                <Input value={business.phone} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} leftIcon={<Phone />} />
              </Field>
              <Field label="Number of employees">
                <SimpleSelect value={business.employees} onValueChange={(v) => setBusiness({ ...business, employees: v })} options={EMPLOYEE_RANGES.map((r) => ({ value: r, label: r }))} />
              </Field>
            </div>
          </StepFrame>
        ) : null}

        {/* Step 3 — Purpose */}
        {step === 2 ? (
          <StepFrame title="What should your AI agent do?" description="Select everything that applies — you can change this later.">
            <div className="grid gap-3 sm:grid-cols-3">
              {AGENT_PURPOSES.map((p) => {
                const on = purposes.includes(p.key);
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPurposes((ps) => (on ? ps.filter((x) => x !== p.key) : [...ps, p.key]))}
                    className={cn(
                      "flex flex-col items-start rounded-2xl border p-4 text-left transition-all",
                      on ? "border-primary/60 bg-primary-soft shadow-glow" : "border-border bg-surface/70 hover:border-border-strong",
                    )}
                    aria-pressed={on}
                  >
                    <span className={cn("flex size-6 items-center justify-center rounded-md border", on ? "border-primary bg-primary text-white" : "border-border-strong")}>{on ? <Check className="size-3.5" /> : null}</span>
                    <span className="mt-3 text-sm font-semibold">{p.label}</span>
                    <span className="mt-0.5 text-xs text-muted">{p.description}</span>
                  </button>
                );
              })}
            </div>
          </StepFrame>
        ) : null}

        {/* Step 4 — Template */}
        {step === 3 ? (
          <StepFrame title="Choose an agent template" description="Start from a proven playbook for your industry. Every template is fully editable.">
            {templates.length === 0 ? (
              <div className="flex justify-center py-10">
                <Spinner size={24} />
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {templates.map((t) => {
                  const on = t.id === templateId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTemplateId(t.id)}
                      className={cn("flex items-start gap-3 rounded-2xl border p-4 text-left transition-all", on ? "border-primary/60 bg-primary-soft" : "border-border bg-surface/70 hover:border-border-strong")}
                      aria-pressed={on}
                    >
                      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4", on ? "bg-primary text-white" : "bg-surface-2 text-[#a3a3ff]")}>{templateIcons[t.icon]}</span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          {t.name}
                          {t.industry === business.industry ? <Badge variant="accent">Recommended</Badge> : null}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">{t.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </StepFrame>
        ) : null}

        {/* Step 5 — Voice */}
        {step === 4 ? (
          <StepFrame title="Configure the voice" description="Pick how your agent sounds. You can fine-tune responsiveness and interruption handling later in the Agent Builder.">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-5">
                <Field label="Voice">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {voiceLibrary.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVoice({ ...voice, voiceId: v.id, gender: v.gender, accent: v.accent })}
                        className={cn("flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left", voice.voiceId === v.id ? "border-primary/60 bg-primary-soft" : "border-border bg-surface/70 hover:border-border-strong")}
                      >
                        <span className="flex size-8 items-center justify-center rounded-full bg-surface-2">
                          <Mic className="size-4 text-muted" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">
                            {v.name} <span className="text-xs font-normal text-muted capitalize">· {v.gender} · {v.accent}</span>
                          </span>
                          <span className="block text-[11px] text-muted">{v.sample}</span>
                        </span>
                        <Badge variant="muted" className="capitalize">{v.provider}</Badge>
                      </button>
                    ))}
                  </div>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Accent">
                    <SimpleSelect value={voice.accent} onValueChange={(v) => setVoice({ ...voice, accent: v })} options={ACCENTS.map((a) => ({ value: a, label: a }))} />
                  </Field>
                  <Field label="Language">
                    <SimpleSelect value={voice.language} onValueChange={(v) => setVoice({ ...voice, language: v as LanguageCode })} options={LANGUAGES.map((l) => ({ value: l.code, label: `${l.label} (${l.native})` }))} />
                  </Field>
                </div>
                <Field label={`Speaking speed · ${voice.speed.toFixed(2)}×`}>
                  <Slider min={0.7} max={1.4} step={0.05} value={[voice.speed]} onValueChange={([v]) => setVoice({ ...voice, speed: v })} />
                </Field>
                <Field label="Tone">
                  <div className="flex flex-wrap gap-2">
                    {TONES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setVoice({ ...voice, tone: t.value })}
                        className={cn("rounded-full border px-3 py-1.5 text-xs font-medium", voice.tone === t.value ? "border-primary/60 bg-primary-soft text-[#c7c7ff]" : "border-border text-foreground-secondary hover:border-border-strong")}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
              <div className="rounded-2xl border border-border bg-surface/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Preview</p>
                <p className="mt-3 text-sm leading-relaxed text-foreground-secondary">
                  &ldquo;Hi, thank you for calling {business.name}. I&apos;m {agentName}, the virtual assistant. How can I help you today?&rdquo;
                </p>
                <div className="mt-4 flex h-10 items-center justify-center rounded-lg bg-background-subtle">{previewing ? <Waveform /> : <span className="text-xs text-faint">Ready to play</span>}</div>
                <Button className="mt-4 w-full" variant="secondary" onClick={previewVoice} loading={previewing}>
                  {!previewing ? <Volume2 /> : null} Preview Voice
                </Button>
              </div>
            </div>
          </StepFrame>
        ) : null}

        {/* Step 6 — Knowledge */}
        {step === 5 ? (
          <StepFrame title="Connect your knowledge" description="Give your agent the facts it needs — services, pricing, policies and FAQs. Sources are indexed and ready in seconds.">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="space-y-5">
                <Field label="Website URL" hint="We'll crawl public pages and extract useful content.">
                  <div className="flex gap-2">
                    <Input value={kbInput.url} onChange={(e) => setKbInput({ ...kbInput, url: e.target.value })} placeholder={business.website || "https://yourwebsite.com"} leftIcon={<Globe />} />
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const u = kbInput.url || business.website;
                        if (!u) return;
                        addKnowledge(u, "Website");
                        setKbInput({ ...kbInput, url: "" });
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </Field>
                <Field label="Documents" hint="PDF, DOCX or TXT up to 25 MB each.">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface/50 px-6 py-8 text-center transition-colors hover:border-primary/60 hover:bg-primary-soft/20">
                    <Upload className="size-6 text-muted" />
                    <span className="mt-2 text-sm font-medium">Drop files here or click to upload</span>
                    <span className="text-xs text-muted">PDF · DOCX · TXT</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      multiple
                      className="sr-only"
                      onChange={(e) => {
                        Array.from(e.target.files ?? []).forEach((f) => addKnowledge(f.name, f.name.split(".").pop()?.toUpperCase() ?? "File"));
                        e.target.value = "";
                      }}
                    />
                  </label>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="FAQ entry">
                    <Input value={kbInput.faqQ} onChange={(e) => setKbInput({ ...kbInput, faqQ: e.target.value })} placeholder="Question — e.g. Do you accept insurance?" className="mb-2" />
                    <Textarea value={kbInput.faqA} onChange={(e) => setKbInput({ ...kbInput, faqA: e.target.value })} placeholder="Answer" className="min-h-[70px]" />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2"
                      disabled={!kbInput.faqQ || !kbInput.faqA}
                      onClick={() => {
                        addKnowledge(kbInput.faqQ, "FAQ");
                        setKbInput({ ...kbInput, faqQ: "", faqA: "" });
                      }}
                    >
                      Add FAQ
                    </Button>
                  </Field>
                  <Field label="Manual text">
                    <Textarea value={kbInput.text} onChange={(e) => setKbInput({ ...kbInput, text: e.target.value })} placeholder="Paste service descriptions, pricing, policies…" className="min-h-[118px]" />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2"
                      disabled={!kbInput.text}
                      onClick={() => {
                        addKnowledge(`Manual note (${kbInput.text.slice(0, 24)}…)`, "Text");
                        setKbInput({ ...kbInput, text: "" });
                      }}
                    >
                      Add text
                    </Button>
                  </Field>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-surface/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Sources ({knowledge.length})</p>
                {knowledge.length === 0 ? (
                  <p className="mt-3 text-sm text-muted">No sources yet. Your agent can still take calls, but will offer to connect callers to a human for detailed questions.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {knowledge.map((k) => (
                      <li key={k.id} className="flex items-center gap-2 rounded-lg border border-border bg-background-subtle px-3 py-2">
                        {k.kind === "Website" ? <Globe className="size-4 text-muted" /> : k.kind === "FAQ" ? <MessageSquareText className="size-4 text-muted" /> : k.kind === "Text" ? <FileText className="size-4 text-muted" /> : <FileText className="size-4 text-muted" />}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-medium">{k.label}</span>
                          <span className="block text-[10px] text-muted">{k.kind}</span>
                        </span>
                        {k.status === "processing" ? <Badge variant="accent" dot pulse>Processing</Badge> : <Badge variant="success" dot>Ready</Badge>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </StepFrame>
        ) : null}

        {/* Step 7 — Phone */}
        {step === 6 ? (
          <StepFrame title="Connect a phone number" description="Your agent needs a number to answer and place calls. You can add more numbers any time.">
            <RadioGroup value={phoneChoice} onValueChange={(v) => setPhoneChoice(v as typeof phoneChoice)} className="grid gap-3 sm:grid-cols-2">
              {[
                { key: "buy", title: "Buy a LeadPulz number", text: "Instant provisioning in 40+ countries. From ₹799/month.", icon: <Phone /> },
                { key: "twilio", title: "Connect Twilio", text: "Use your existing Twilio account and numbers.", icon: <Link2 /> },
                { key: "existing", title: "Connect existing number", text: "Forward your current business line via SIP or call forwarding.", icon: <PhoneCall /> },
                { key: "skip", title: "Skip for now", text: "Test in the browser and add a number later.", icon: <MonitorSmartphone /> },
              ].map((o) => (
                <label key={o.key} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border p-4", phoneChoice === o.key ? "border-primary/60 bg-primary-soft" : "border-border bg-surface/70 hover:border-border-strong")}>
                  <RadioGroupItem value={o.key} className="mt-0.5" />
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-[#a3a3ff] [&_svg]:size-4">{o.icon}</span>
                  <span>
                    <span className="block text-sm font-semibold">{o.title}</span>
                    <span className="block text-xs text-muted">{o.text}</span>
                  </span>
                </label>
              ))}
            </RadioGroup>
            {phoneChoice === "buy" ? (
              <div className="mt-5 grid gap-4 rounded-2xl border border-border bg-surface/70 p-4 sm:grid-cols-3">
                <Field label="Country">
                  <SimpleSelect value={business.country} onValueChange={(v) => setBusiness({ ...business, country: v })} options={COUNTRIES.map((c) => ({ value: c, label: c }))} />
                </Field>
                <Field label="Area code (optional)">
                  <Input placeholder="040" />
                </Field>
                <Field label="Suggested number">
                  <div className="flex h-9 items-center rounded-lg border border-border bg-background-subtle px-3 font-mono text-sm">+91 40 6969 1203</div>
                </Field>
              </div>
            ) : null}
            {phoneChoice === "twilio" ? (
              <div className="mt-5 grid gap-4 rounded-2xl border border-border bg-surface/70 p-4 sm:grid-cols-2">
                <Field label="Account SID">
                  <Input placeholder="AC••••••••••••••••" />
                </Field>
                <Field label="Auth token" hint="Stored encrypted. Never exposed to the browser after saving.">
                  <Input type="password" placeholder="••••••••••••" />
                </Field>
              </div>
            ) : null}
            {phoneChoice === "existing" ? (
              <div className="mt-5 grid gap-4 rounded-2xl border border-border bg-surface/70 p-4 sm:grid-cols-2">
                <Field label="Your number">
                  <Input placeholder="+91 40 4567 8900" defaultValue={business.phone} />
                </Field>
                <Field label="Forwarding method">
                  <SimpleSelect value="forward" options={[{ value: "forward", label: "Carrier call forwarding" }, { value: "sip", label: "SIP trunk" }]} />
                </Field>
              </div>
            ) : null}
          </StepFrame>
        ) : null}

        {/* Step 8 — Test */}
        {step === 7 ? (
          <StepFrame title="Test your agent" description={`Talk to ${agentName} before going live. Try asking about services, pricing or booking an appointment.`}>
            <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
              <div className="space-y-3">
                <div className="rounded-2xl border border-border bg-surface/70 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white">
                      <Bot className="size-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{agentName}</span>
                      <span className="block text-xs text-muted">{template?.name}</span>
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted">
                    <span>Status</span>
                    {testing === "idle" ? <Badge variant="muted">Ready</Badge> : testing === "connecting" ? <Badge variant="accent" dot pulse>Connecting</Badge> : testing === "live" ? <Badge variant="success" dot pulse>Live · {formatDuration(elapsed)}</Badge> : <Badge variant="default">Call ended</Badge>}
                  </div>
                </div>
                <Button className="w-full" onClick={() => startTest("call")} disabled={testing === "connecting" || testing === "live"}>
                  <PhoneCall /> Call Agent
                </Button>
                <Button className="w-full" variant="secondary" onClick={() => startTest("browser")} disabled={testing === "connecting" || testing === "live"}>
                  <Headphones /> Test in Browser
                </Button>
                <p className="text-[11px] text-faint">Call Agent rings {business.phone || "your phone"}. Browser test uses your microphone.</p>
              </div>
              <div className="flex min-h-[360px] flex-col rounded-2xl border border-border bg-surface/70">
                <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Live transcript</p>
                  {testing === "live" ? <Waveform /> : null}
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {transcript.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted">
                      <Play className="mb-2 size-6 text-faint" />
                      {testing === "connecting" ? "Connecting…" : "Start a test call to see the conversation here."}
                    </div>
                  ) : (
                    transcript.map((t) => (
                      <div key={t.id} className={cn("flex", t.speaker === "ai" ? "justify-start" : "justify-end")}>
                        <div className={cn("max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed", t.speaker === "ai" ? "rounded-tl-sm bg-surface-2 text-foreground" : "rounded-tr-sm bg-primary text-white")}>
                          <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wider opacity-60">{t.speaker === "ai" ? agentName : "You"}</span>
                          {t.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </StepFrame>
        ) : null}

        {/* Step 9 — Launch */}
        {step === 8 ? (
          <div className="text-center">
            <div className="relative mx-auto mb-6 size-20">
              <div className="absolute inset-0 rounded-full bg-success/30 blur-2xl" />
              <div className="relative flex size-20 items-center justify-center rounded-full border border-success/40 bg-success-soft text-success">
                <CheckCircle2 className="size-10" />
              </div>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your AI Revenue Agent is ready.</h1>
            <p className="mx-auto mt-4 max-w-lg text-[15px] text-foreground-secondary">
              {agentName} is live for {business.name}. Calls to {phoneChoice === "skip" ? "your browser test line" : "+91 40 6969 1203"} will now be answered instantly, qualified and booked into your calendar.
            </p>
            <div className="mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-3">
              {[
                ["Template", template?.name ?? "—"],
                ["Voice", `${agentName} · ${voice.accent}`],
                ["Knowledge", `${knowledge.length} source${knowledge.length === 1 ? "" : "s"}`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-border bg-surface/70 p-3">
                  <p className="text-[11px] text-muted">{k}</p>
                  <p className="truncate text-sm font-medium">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => router.push("/dashboard")}>
                Go to Dashboard <ArrowRight />
              </Button>
              <Button size="lg" variant="secondary" onClick={() => router.push(agentId ? `/agents/${agentId}` : "/agents")}>
                <Bot /> View Agent
              </Button>
            </div>
          </div>
        ) : null}

        {/* Footer nav */}
        {step > 0 && step < 8 ? (
          <div className="mt-10 flex items-center justify-between border-t border-border/60 pt-6">
            <Button variant="ghost" onClick={back}>
              <ArrowLeft /> Back
            </Button>
            {step === 7 ? (
              <Button size="lg" onClick={launch} loading={launching}>
                {!launching ? <Rocket /> : null} Launch Agent
              </Button>
            ) : (
              <Button onClick={next} disabled={!canContinue()}>
                Continue <ArrowRight />
              </Button>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}

function StepFrame({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      {description ? <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p> : null}
      <div className="mt-8">{children}</div>
    </div>
  );
}
