"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Bot,
  Calendar,
  Check,
  ChevronDown,
  HelpCircle,
  Megaphone,
  Menu,
  Phone,
  Plus,
  Search,
  UserPlus,
  Workflow,
  AlertTriangle,
  CreditCard,
  Plug,
  PhoneOff,
  Sparkles,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import { Button } from "@/components/ui/button";
import { Kbd, Popover, PopoverContent, PopoverTrigger, ScrollArea, Tip } from "@/components/ui/primitives";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Notification, NotificationType } from "@/types";
import { timeAgo } from "@/lib/format";
import { toast } from "sonner";

const notifIcon: Record<NotificationType, React.ReactNode> = {
  new_qualified_lead: <Sparkles className="text-primary" />,
  appointment_booked: <Calendar className="text-success" />,
  high_value_lead: <Flame className="text-danger" />,
  failed_call: <PhoneOff className="text-danger" />,
  campaign_completed: <Megaphone className="text-accent" />,
  integration_error: <Plug className="text-warning" />,
  payment_issue: <CreditCard className="text-warning" />,
  agent_issue: <AlertTriangle className="text-warning" />,
};

export function WorkspaceSelector() {
  const { organizationId, workspaceId, setWorkspace } = useAppStore();
  const { data: workspaces } = useQuery(() => services.tenant.getWorkspaces(organizationId), [organizationId]);
  const current = workspaces?.find((w) => w.id === workspaceId) ?? workspaces?.[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="hidden md:inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-foreground-secondary hover:bg-surface-2 hover:text-foreground">
          <span className="size-1.5 rounded-full bg-success" />
          <span className="max-w-[180px] truncate">{current?.name ?? "Workspace"}</span>
          <ChevronDown className="size-3.5 text-muted" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {workspaces?.map((w) => (
          <DropdownMenuItem key={w.id} onClick={() => setWorkspace(w.id)}>
            <span className="flex-1 truncate">{w.name}</span>
            {w.id === (current?.id ?? "") ? <Check className="size-4 text-primary" /> : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings?section=organization">
            <Plus /> New workspace
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function QuickCreate() {
  const items = [
    { label: "New AI Agent", href: "/agents/new", icon: Bot },
    { label: "Start Campaign", href: "/campaigns/new", icon: Megaphone },
    { label: "Add Lead", href: "/leads?new=1", icon: UserPlus },
    { label: "Book Appointment", href: "/appointments?new=1", icon: Calendar },
    { label: "Add Phone Number", href: "/phone-numbers?new=1", icon: Phone },
    { label: "Create Workflow", href: "/workflows/new", icon: Workflow },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="shrink-0 gap-1.5">
          <Plus /> <span className="hidden sm:inline">Create</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick create</DropdownMenuLabel>
        {items.map((i) => (
          <DropdownMenuItem key={i.href} asChild>
            <Link href={i.href}>
              <i.icon /> {i.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NotificationCenter() {
  const { data, setData, refetch } = useQuery(() => services.notifications.list(), []);
  const router = useRouter();
  const unread = data?.filter((n) => !n.read).length ?? 0;

  useEffect(() => {
    const unsub = services.notifications.subscribe((n: Notification) => {
      setData((prev) => [n, ...(prev ?? [])]);
      toast(n.title, { description: n.body, action: n.href ? { label: "View", onClick: () => router.push(n.href!) } : undefined });
    });
    return unsub;
  }, [setData, router]);

  const open = async (n: Notification) => {
    await services.notifications.markRead(n.id);
    setData((prev) => (prev ?? []).map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    if (n.href) router.push(n.href);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="relative flex size-9 items-center justify-center rounded-lg text-foreground-secondary hover:bg-surface-2 hover:text-foreground" aria-label="Notifications">
          <Bell className="size-[18px]" />
          {unread > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white ring-2 ring-background">
              {unread}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" collisionPadding={8} className="w-[calc(100vw-1rem)] max-w-[380px] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <Button
            variant="link"
            size="xs"
            onClick={async () => {
              await services.notifications.markAllRead();
              refetch();
            }}
          >
            Mark all read
          </Button>
        </div>
        <ScrollArea className="max-h-[min(420px,60vh)]">
          <ul className="divide-y divide-border">
            {data?.map((n) => (
              <li key={n.id}>
                <button type="button" onClick={() => open(n)} className={cn("flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2", !n.read && "bg-primary-soft/30")}>
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 [&_svg]:size-4">{notifIcon[n.type]}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-medium text-foreground">{n.title}</span>
                      {!n.read ? <span className="size-1.5 rounded-full bg-primary" /> : null}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted line-clamp-2">{n.body}</span>
                    <span className="mt-1 block text-[11px] text-faint" suppressHydrationWarning>
                      {timeAgo(n.createdAt)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export function Topbar({ title }: { title?: string }) {
  const { setMobileNavOpen, setCommandOpen } = useAppStore();
  const [isMac, setIsMac] = useState(false);
  // Platform detection after mount — intentional.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setIsMac(navigator.platform.toUpperCase().includes("MAC")), []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-1.5 border-b border-border bg-background/80 px-3 backdrop-blur-md sm:h-16 sm:gap-3 sm:px-4 lg:px-6">
      <button type="button" className="lg:hidden flex size-9 shrink-0 items-center justify-center rounded-lg hover:bg-surface-2" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation">
        <Menu className="size-5" />
      </button>
      <WorkspaceSelector />
      {title ? <span className="hidden xl:inline text-sm text-muted">/ {title}</span> : null}

      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className="ml-auto hidden h-9 w-full max-w-[420px] items-center gap-2 rounded-lg border border-border bg-background-subtle px-3 text-left text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground-secondary sm:flex"
      >
        <Search className="size-4" />
        <span className="flex-1 truncate">Search leads, calls, agents…</span>
        <span className="hidden md:flex items-center gap-1">
          <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>
      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className="ml-auto flex size-9 items-center justify-center rounded-lg text-foreground-secondary hover:bg-surface-2 hover:text-foreground sm:hidden"
        aria-label="Search"
      >
        <Search className="size-[18px]" />
      </button>

      <QuickCreate />
      <NotificationCenter />
      <Tip content="Help & documentation">
        <Link href="/help" className="hidden sm:flex size-9 items-center justify-center rounded-lg text-foreground-secondary hover:bg-surface-2 hover:text-foreground" aria-label="Help">
          <HelpCircle className="size-[18px]" />
        </Link>
      </Tip>
      <UserMenu />
    </header>
  );
}

function UserMenu() {
  const { data: user } = useQuery(() => services.auth.getCurrentUser(), []);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex items-center gap-2 rounded-lg p-1 hover:bg-surface-2" aria-label="User menu">
          <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-[11px] font-bold text-white">
            {user?.fullName
              ?.split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("") ?? "SH"}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <span className="block text-foreground">{user?.fullName}</span>
          <span className="block font-normal text-muted">{user?.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings?section=profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/billing">Billing</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin">Platform admin</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/login">Sign out</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
