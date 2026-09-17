"use client";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { MobileNav, Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandPalette } from "./command-palette";

export function AppShell({ children }: { children: React.ReactNode }) {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileNav />
      <CommandPalette />
      <div className={cn("flex min-h-screen min-w-0 flex-col transition-[padding] duration-200", collapsed ? "lg:pl-[68px]" : "lg:pl-[248px]")}>
        <Topbar />
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 lp-safe-bottom">
          <div className="mx-auto w-full min-w-0 max-w-[1480px] animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
