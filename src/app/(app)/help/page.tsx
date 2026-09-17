"use client";

import Link from "next/link";
import { BookOpen, Code2, LifeBuoy, MessageCircle, PlayCircle, Rocket, Search, Video } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RevenueChain } from "@/components/dashboard/revenue-chain";

const guides = [
  { icon: <Rocket />, title: "Getting started", text: "Build and launch your first AI Revenue Agent in 5 minutes.", href: "/onboarding" },
  { icon: <BookOpen />, title: "Agent Builder guide", text: "Prompts, conversation flows, voice tuning and qualification scoring.", href: "/agents" },
  { icon: <Code2 />, title: "API & webhooks", text: "Integrate LeadPulz with your stack. REST, webhooks and SDKs.", href: "/settings?section=api" },
  { icon: <MessageCircle />, title: "WhatsApp & follow-ups", text: "Templates, sequences and multi-channel automation.", href: "/follow-ups" },
  { icon: <Video />, title: "Video tutorials", text: "Short walkthroughs of every module.", href: "#demo" },
  { icon: <LifeBuoy />, title: "Contact support", text: "Priority support on Growth and above. Typical reply under 2 hours.", href: "#support" },
];

export default function HelpPage() {
  return (
    <div>
      <PageHeader title="Help & Documentation" description="Guides, API reference and support for LeadPulz AI." />
      <Input placeholder="Search the docs…" leftIcon={<Search />} className="mb-6 max-w-lg" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {guides.map((g) => (
          <Card key={g.title} interactive className="p-5">
            <Link href={g.href} className="block">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-[#a3a3ff] [&_svg]:size-4">{g.icon}</span>
              <p className="mt-3 text-sm font-semibold">{g.title}</p>
              <p className="mt-1 text-xs text-muted">{g.text}</p>
            </Link>
          </Card>
        ))}
      </div>
      <Card id="demo" className="mt-8 overflow-hidden">
        <div className="grid lg:grid-cols-2">
          <div className="p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Product demo</p>
            <h2 className="mt-2 text-xl font-semibold">See LeadPulz turn a call into revenue</h2>
            <p className="mt-2 text-sm text-muted">Watch Maya answer an inbound enquiry, qualify the caller, book a consultation and trigger follow-ups — end to end in under 3 minutes.</p>
            <RevenueChain className="mt-4" compact />
            <Button className="mt-5" onClick={() => toast.info("Demo video will open here")}><PlayCircle /> Watch demo</Button>
          </div>
          <div className="flex min-h-[240px] items-center justify-center lp-ambient border-l border-border">
            <button type="button" onClick={() => toast.info("Demo video will open here")} className="flex size-16 items-center justify-center rounded-full bg-primary text-white shadow-glow transition-transform hover:scale-105" aria-label="Play demo"><PlayCircle className="size-8" /></button>
          </div>
        </div>
      </Card>
      <Card id="support" className="mt-6 p-6">
        <h2 className="text-lg font-semibold">Need a hand?</h2>
        <p className="mt-1 text-sm text-muted">Email <a href="mailto:support@leadpulz.ai" className="text-[#a3a3ff] hover:underline">support@leadpulz.ai</a> or chat with us from the app. Built by FlowFoundry AI Solutions.</p>
        <div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" onClick={() => toast.success("Support chat opened")}><MessageCircle /> Chat with support</Button><Button variant="ghost" asChild><a href="#terms">Terms</a></Button><Button variant="ghost" asChild><a href="#privacy">Privacy</a></Button></div>
      </Card>
    </div>
  );
}
