"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Bot, Calendar, Megaphone, Phone, PhoneCall, Search, Settings, UserSquare2, LayoutDashboard, BarChart3, Plus, ArrowRight } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { services } from "@/services";
import type { SearchResult } from "@/types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Kbd, Spinner } from "@/components/ui/primitives";
import { mainNav } from "./nav-config";

const typeIcon: Record<SearchResult["type"], React.ReactNode> = {
  lead: <UserSquare2 />,
  call: <PhoneCall />,
  agent: <Bot />,
  appointment: <Calendar />,
  campaign: <Megaphone />,
  phone_number: <Phone />,
  page: <ArrowRight />,
};

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useAppStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commandOpen, setCommandOpen]);

  // Reset query when the palette closes — intentional.
   
  useEffect(() => {
    if (!commandOpen) {
      setQuery("");
      setResults([]);
      return;
    }
  }, [commandOpen]);

  // Debounced search against the service layer — intentional.
   
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const r = await services.search.search(query);
      if (!cancelled) {
        setResults(r);
        setLoading(false);
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const go = (href: string) => {
    setCommandOpen(false);
    router.push(href);
  };

  const quick = [
    { label: "New AI Agent", href: "/agents/new", icon: Bot },
    { label: "Start Campaign", href: "/campaigns/new", icon: Megaphone },
    { label: "Add Lead", href: "/leads?new=1", icon: UserSquare2 },
    { label: "Book Appointment", href: "/appointments?new=1", icon: Calendar },
  ];

  return (
    <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
      <DialogContent size="lg" hideClose className="p-0 gap-0 overflow-hidden top-[18%] translate-y-0">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <Command shouldFilter={!query.trim()} className="flex flex-col">
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="size-4 text-muted" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search leads, calls, agents, appointments, campaigns…"
              className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-faint"
            />
            {loading ? <Spinner /> : <Kbd>Esc</Kbd>}
          </div>
          <Command.List className="max-h-[420px] overflow-y-auto p-2">
            <Command.Empty className="px-3 py-10 text-center text-sm text-muted">{query ? "No results found." : "Type to search…"}</Command.Empty>

            {results.length > 0 ? (
              <Command.Group heading="Results" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted">
                {results.map((r) => (
                  <Command.Item
                    key={`${r.type}-${r.id}`}
                    value={`${r.type}-${r.id}-${r.title}`}
                    onSelect={() => go(r.href)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm aria-selected:bg-surface-2 [&_svg]:size-4 [&_svg]:text-muted"
                  >
                    <span className="flex size-7 items-center justify-center rounded-md bg-elevated">{typeIcon[r.type]}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-foreground">{r.title}</span>
                      {r.subtitle ? <span className="block truncate text-xs text-muted">{r.subtitle}</span> : null}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-faint">{r.type.replace("_", " ")}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null}

            {!query.trim() ? (
              <>
                <Command.Group heading="Quick actions" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted">
                  {quick.map((q) => (
                    <Command.Item key={q.href} value={q.label} onSelect={() => go(q.href)} className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm aria-selected:bg-surface-2 [&_svg]:size-4 [&_svg]:text-muted">
                      <Plus className="!text-primary" />
                      <span className="flex-1">{q.label}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
                <Command.Group heading="Navigate" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted">
                  {mainNav.map((n) => (
                    <Command.Item key={n.href} value={`go ${n.label}`} onSelect={() => go(n.href)} className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm aria-selected:bg-surface-2 [&_svg]:size-4 [&_svg]:text-muted">
                      <n.icon />
                      <span className="flex-1">{n.label}</span>
                    </Command.Item>
                  ))}
                  <Command.Item value="go Dashboard overview" onSelect={() => go("/dashboard")} className="hidden">
                    <LayoutDashboard />
                  </Command.Item>
                  <Command.Item value="go Analytics reports" onSelect={() => go("/analytics")} className="hidden">
                    <BarChart3 />
                  </Command.Item>
                  <Command.Item value="go Settings preferences" onSelect={() => go("/settings")} className="hidden">
                    <Settings />
                  </Command.Item>
                </Command.Group>
              </>
            ) : null}
          </Command.List>
          <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-muted">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <Kbd>↵</Kbd> open
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
