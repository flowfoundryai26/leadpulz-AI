"use client";

import Link from "next/link";
import { Bot, PlayCircle, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { useEffect, useState } from "react";
import { RevenueChain } from "./revenue-chain";

/** In-app landing shown to first-time users. */
export function WelcomeHero() {
  const { firstVisitSeen, setFirstVisitSeen } = useAppStore();
  const [mounted, setMounted] = useState(false);
  // Avoid hydration mismatch with persisted store — intentional.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted || firstVisitSeen) return null;
  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-border lp-ambient p-6 sm:p-10">
      <button type="button" onClick={() => setFirstVisitSeen(true)} className="absolute right-4 top-4 rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground" aria-label="Dismiss">
        <X className="size-4" />
      </button>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-xs font-medium text-[#c7c7ff]">
            <Bot className="size-3.5" /> AI Revenue Operations Platform
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            <span className="lp-gradient-text">Your AI Revenue Team Never Sleeps.</span>
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-foreground-secondary">
            Deploy AI agents that talk to customers, qualify opportunities, book appointments, follow up automatically, and turn conversations into revenue.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/agents/new">
                Create AI Agent <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/help#demo">
                <PlayCircle /> Watch Demo
              </Link>
            </Button>
          </div>
        </div>
        <RevenueChain />
      </div>
    </section>
  );
}
