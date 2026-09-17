"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowLeft, Menu, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import { adminNav } from "@/components/layout/nav-config";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/primitives";

function AdminNavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {adminNav.map((item) => {
        const active = item.match ? item.match(pathname) : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate} className={cn("flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium", active ? "bg-primary-soft text-foreground" : "text-foreground-secondary hover:bg-surface-2 hover:text-foreground")}>
            <item.icon className={cn("size-[18px]", active ? "text-[#a3a3ff]" : "text-muted")} />{item.label}
          </Link>
        );
      })}
    </>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  // Close on Escape and lock body scroll while the drawer is open.
  // (Links close it themselves via onNavigate.)
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNavOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [navOpen]);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-border bg-background-subtle lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-4"><Logo /></div>
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-xs font-medium text-danger"><ShieldCheck className="size-4" /> Platform Administration</div>
        <nav className="mt-3 flex-1 space-y-0.5 overflow-y-auto px-3">
          <AdminNavLinks pathname={pathname} />
        </nav>
        <div className="border-t border-border p-3"><Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-muted hover:bg-surface-2 hover:text-foreground"><ArrowLeft className="size-4" /> Back to app</Link></div>
      </aside>

      {navOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-fade-in" onClick={() => setNavOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col border-r border-border bg-background-subtle animate-[slide-in-left_0.25s_cubic-bezier(0.16,1,0.3,1)] lp-safe-bottom">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
              <Logo />
              <button type="button" onClick={() => setNavOpen(false)} className="flex size-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground" aria-label="Close navigation">
                <X className="size-5" />
              </button>
            </div>
            <div className="mx-3 mt-3 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-xs font-medium text-danger"><ShieldCheck className="size-4" /> Platform Administration</div>
            <nav className="mt-3 flex-1 space-y-0.5 overflow-y-auto px-3 pb-3">
              <AdminNavLinks pathname={pathname} onNavigate={() => setNavOpen(false)} />
            </nav>
            <div className="shrink-0 border-t border-border p-3"><Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-muted hover:bg-surface-2 hover:text-foreground"><ArrowLeft className="size-4" /> Back to app</Link></div>
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-[240px]">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-md sm:h-16 sm:gap-3 sm:px-4 lg:px-6">
          <button type="button" className="flex size-9 shrink-0 items-center justify-center rounded-lg hover:bg-surface-2 lg:hidden" onClick={() => setNavOpen(true)} aria-label="Open navigation">
            <Menu className="size-5" />
          </button>
          <span className="truncate text-sm font-semibold">LeadPulz Platform</span>
          <Badge variant="danger" className="shrink-0">Internal</Badge>
          <span className="ml-auto hidden items-center gap-2 text-xs text-muted md:flex"><StatusDot tone="success" pulse /> All systems operational · <span className="font-mono">eu-west-1 · ap-south-1</span></span>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-muted md:hidden"><StatusDot tone="success" pulse /> Operational</span>
          <Link href="/dashboard" className="hidden shrink-0 text-xs text-[#a3a3ff] hover:underline sm:inline lg:hidden">Back to app</Link>
        </header>
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:py-8 lp-safe-bottom"><div className="mx-auto w-full min-w-0 max-w-[1480px] animate-fade-in">{children}</div></main>
      </div>
    </div>
  );
}
