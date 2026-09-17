import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { RevenueChain } from "@/components/dashboard/revenue-chain";
import { COMPANY_NAME } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden border-r border-border lp-ambient lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/">
          <Logo />
        </Link>
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">AI Revenue Operations Platform</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
            <span className="lp-gradient-text">Turn Every Conversation Into Revenue.</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-foreground-secondary">
            AI Revenue Agents that talk, qualify, book, follow up, and convert — 24/7, in 13 languages, connected to your CRM and calendar.
          </p>
          <RevenueChain className="mt-8" compact />
          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
            {[
              ["1.2M+", "conversations handled"],
              ["25.4%", "avg. conversion rate"],
              ["0.8s", "answer time"],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="text-2xl font-semibold tabular-nums">{v}</p>
                <p className="text-xs text-muted">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-faint">© {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
      </aside>

      <main className="flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <div className="w-full max-w-[420px] animate-slide-up">{children}</div>
      </main>
    </div>
  );
}
