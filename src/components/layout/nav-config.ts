import {
  BarChart3,
  Bot,
  BookOpen,
  Calendar,
  CreditCard,
  LayoutDashboard,
  Megaphone,
  Phone,
  PhoneCall,
  Plug,
  Repeat,
  Settings,
  Users,
  UserSquare2,
  Workflow,
  Building2,
  Activity,
  ShieldCheck,
  LifeBuoy,
  ScrollText,
  Wallet,
  Gauge,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  match?: (pathname: string) => boolean;
}

export const mainNav: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Agents", href: "/agents", icon: Bot },
  { label: "Calls", href: "/calls", icon: PhoneCall, match: (p) => p.startsWith("/calls") || p.startsWith("/conversations") },
  { label: "Leads", href: "/leads", icon: UserSquare2 },
  { label: "Appointments", href: "/appointments", icon: Calendar },
  { label: "Campaigns", href: "/campaigns", icon: Megaphone },
  { label: "Follow-ups", href: "/follow-ups", icon: Repeat },
  { label: "Knowledge", href: "/knowledge", icon: BookOpen },
  { label: "Workflows", href: "/workflows", icon: Workflow },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Phone Numbers", href: "/phone-numbers", icon: Phone },
  { label: "Integrations", href: "/integrations", icon: Plug },
  { label: "Team", href: "/team", icon: Users },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const adminNav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: Gauge, match: (p) => p === "/admin" },
  { label: "Organizations", href: "/admin/organizations", icon: Building2 },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: Wallet },
  { label: "Usage", href: "/admin/usage", icon: Activity },
  { label: "Agents", href: "/admin/agents", icon: Bot },
  { label: "Calls", href: "/admin/calls", icon: PhoneCall },
  { label: "Revenue", href: "/admin/revenue", icon: BarChart3 },
  { label: "System Health", href: "/admin/system-health", icon: ShieldCheck },
  { label: "Integrations", href: "/admin/integrations", icon: Plug },
  { label: "Support", href: "/admin/support", icon: LifeBuoy },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
];

export const settingsSections = [
  { key: "profile", label: "Profile" },
  { key: "organization", label: "Organization" },
  { key: "ai", label: "AI Settings" },
  { key: "calling", label: "Calling" },
  { key: "phone-numbers", label: "Phone Numbers" },
  { key: "business-hours", label: "Business Hours" },
  { key: "notifications", label: "Notifications" },
  { key: "integrations", label: "Integrations" },
  { key: "api", label: "API" },
  { key: "security", label: "Security" },
  { key: "billing", label: "Billing" },
  { key: "team", label: "Team" },
  { key: "white-label", label: "White-label" },
] as const;

export type SettingsSectionKey = (typeof settingsSections)[number]["key"];
