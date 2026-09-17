"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import { adminNav } from "@/components/layout/nav-config";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/primitives";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-border bg-background-subtle lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-4"><Logo /></div>
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-xs font-medium text-danger"><ShieldCheck className="size-4" /> Platform Administration</div>
        <nav className="mt-3 flex-1 space-y-0.5 overflow-y-auto px-3">
          {adminNav.map((item) => {
            const active = item.match ? item.match(pathname) : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium", active ? "bg-primary-soft text-foreground" : "text-foreground-secondary hover:bg-surface-2 hover:text-foreground")}>
                <item.icon className={cn("size-[18px]", active ? "text-[#a3a3ff]" : "text-muted")} />{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3"><Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-muted hover:bg-surface-2 hover:text-foreground"><ArrowLeft className="size-4" /> Back to app</Link></div>
      </aside>
      <div className="flex min-h-screen flex-col lg:pl-[240px]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-6 backdrop-blur-md">
          <span className="text-sm font-semibold">LeadPulz Platform</span>
          <Badge variant="danger">Internal</Badge>
          <span className="ml-auto flex items-center gap-2 text-xs text-muted"><StatusDot tone="success" pulse /> All systems operational · <span className="font-mono">eu-west-1 · ap-south-1</span></span>
          <Link href="/dashboard" className="text-xs text-[#a3a3ff] hover:underline lg:hidden">Back to app</Link>
        </header>
        <main className="flex-1 px-6 py-8"><div className="mx-auto w-full max-w-[1480px] animate-fade-in">{children}</div></main>
      </div>
    </div>
  );
}
