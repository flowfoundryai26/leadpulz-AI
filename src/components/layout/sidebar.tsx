"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronsUpDown, HelpCircle, LogOut, PanelLeftClose, PanelLeftOpen, Plus, Settings, ShieldCheck, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { Logo, LogoMark } from "./logo";
import { mainNav, type NavItem } from "./nav-config";
import { Avatar, Tip } from "@/components/ui/primitives";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery } from "@/hooks/use-query";
import { services } from "@/services";
import { Badge } from "@/components/ui/badge";

function NavLink({ item, collapsed, pathname }: { item: NavItem; collapsed: boolean; pathname: string }) {
  const active = item.match ? item.match(pathname) : pathname === item.href || pathname.startsWith(item.href + "/");
  const link = (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
        active ? "bg-primary-soft text-foreground" : "text-foreground-secondary hover:bg-surface-2 hover:text-foreground",
        collapsed && "justify-center px-0",
      )}
      aria-current={active ? "page" : undefined}
    >
      {active ? <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-primary" /> : null}
      <item.icon className={cn("size-[18px] shrink-0", active ? "text-[#a3a3ff]" : "text-muted group-hover:text-foreground-secondary")} />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
      {!collapsed && item.badge ? <Badge variant="primary" className="ml-auto">{item.badge}</Badge> : null}
    </Link>
  );
  return collapsed ? (
    <Tip content={item.label} side="right">
      {link}
    </Tip>
  ) : (
    link
  );
}

export function OrgSwitcher({ collapsed }: { collapsed: boolean }) {
  const { organizationId, setOrganization } = useAppStore();
  const { data: orgs } = useQuery(() => services.tenant.getOrganizations(), []);
  const current = orgs?.find((o) => o.id === organizationId) ?? orgs?.[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg border border-border bg-surface-2/60 px-2.5 py-2 text-left transition-colors hover:bg-surface-2",
            collapsed && "justify-center px-0 border-transparent bg-transparent",
          )}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
            {current?.name?.[0] ?? "A"}
          </span>
          {!collapsed ? (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-foreground">{current?.name ?? "Loading…"}</span>
                <span className="block truncate text-[11px] capitalize text-muted">{current?.plan ?? ""} plan</span>
              </span>
              <ChevronsUpDown className="size-4 shrink-0 text-muted" />
            </>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        {orgs?.map((o) => (
          <DropdownMenuItem key={o.id} onClick={() => setOrganization(o.id)}>
            <span className="flex size-6 items-center justify-center rounded bg-gradient-to-br from-primary to-accent text-[10px] font-bold text-white">{o.name[0]}</span>
            <span className="flex-1 truncate">{o.name}</span>
            {o.id === organizationId ? <Check className="size-4 text-primary" /> : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings?section=organization">
            <Plus /> Create organization
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed: collapsed, toggleSidebar } = useAppStore();
  const { data: user } = useQuery(() => services.auth.getCurrentUser(), []);

  return (
    <aside
      className={cn(
        "hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col border-r border-border bg-background-subtle transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-[248px]",
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-border px-4", collapsed && "justify-center px-0")}>
        <Link href="/dashboard" aria-label="LeadPulz AI home">
          {collapsed ? <LogoMark /> : <Logo />}
        </Link>
      </div>

      <div className="px-3 pt-3">
        <OrgSwitcher collapsed={collapsed} />
      </div>

      <nav className="mt-3 flex-1 space-y-0.5 overflow-y-auto px-3 pb-3" aria-label="Main navigation">
        {mainNav.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} pathname={pathname} />
        ))}
      </nav>

      <div className="border-t border-border p-3 space-y-1">
        <Tip content="Help & docs" side="right">
          <Link
            href="/help"
            className={cn("flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] text-foreground-secondary hover:bg-surface-2 hover:text-foreground", collapsed && "justify-center px-0")}
          >
            <HelpCircle className="size-[18px] text-muted" />
            {!collapsed ? "Help" : null}
          </Link>
        </Tip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={cn("flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-surface-2", collapsed && "justify-center px-0")}>
              <Avatar name={user?.fullName ?? "User"} size="sm" />
              {!collapsed ? (
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-foreground">{user?.fullName ?? "…"}</span>
                  <span className="block truncate text-[11px] text-muted">{user?.email ?? ""}</span>
                </span>
              ) : null}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/settings?section=profile">
                <UserCircle2 /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings /> Settings
              </Link>
            </DropdownMenuItem>
            {user?.platformAdmin ? (
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <ShieldCheck /> Platform admin
                </Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login">
                <LogOut /> Sign out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          type="button"
          onClick={toggleSidebar}
          className={cn("flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] text-muted hover:bg-surface-2 hover:text-foreground", collapsed && "justify-center px-0")}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="size-[18px]" /> : <PanelLeftClose className="size-[18px]" />}
          {!collapsed ? "Collapse" : null}
        </button>
      </div>
    </aside>
  );
}

/** Mobile drawer version of the sidebar */
export function MobileNav() {
  const pathname = usePathname();
  const { mobileNavOpen, setMobileNavOpen } = useAppStore();
  if (!mobileNavOpen) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/60" onClick={() => setMobileNavOpen(false)} />
      <div className="absolute inset-y-0 left-0 w-[280px] border-r border-border bg-background-subtle p-4 animate-slide-up flex flex-col">
        <Logo className="mb-4" />
        <OrgSwitcher collapsed={false} />
        <nav className="mt-3 flex-1 space-y-0.5 overflow-y-auto" onClick={() => setMobileNavOpen(false)}>
          {mainNav.map((item) => (
            <NavLink key={item.href} item={item} collapsed={false} pathname={pathname} />
          ))}
        </nav>
      </div>
    </div>
  );
}
