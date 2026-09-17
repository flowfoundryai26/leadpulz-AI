"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { settingsSections, type SettingsSectionKey } from "@/components/layout/nav-config";
import { cn } from "@/lib/utils";
import { ApiSettings } from "@/components/settings/api-settings";
import { AiSection, BusinessHoursSection, CallingSection, NotificationsSection, OrganizationSection, ProfileSection, RedirectCard, SecuritySection, WhiteLabelSection } from "@/components/settings/sections";

function SettingsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const section = (params.get("section") as SettingsSectionKey) ?? "profile";

  const render = () => {
    switch (section) {
      case "profile": return <ProfileSection />;
      case "organization": return <OrganizationSection />;
      case "ai": return <AiSection />;
      case "calling": return <CallingSection />;
      case "phone-numbers": return <RedirectCard title="Phone numbers" description="Buy, connect and assign numbers to agents." href="/phone-numbers" label="Manage phone numbers" />;
      case "business-hours": return <BusinessHoursSection />;
      case "notifications": return <NotificationsSection />;
      case "integrations": return <RedirectCard title="Integrations" description="Connect CRMs, calendars, communication tools and automation platforms." href="/integrations" label="Open integrations" />;
      case "api": return <ApiSettings />;
      case "security": return <SecuritySection />;
      case "billing": return <RedirectCard title="Billing" description="Plan, usage, invoices and payment method." href="/billing" label="Open billing" />;
      case "team": return <RedirectCard title="Team" description="Invite members and manage roles and permissions." href="/team" label="Manage team" />;
      case "white-label": return <WhiteLabelSection />;
      default: return <ProfileSection />;
    }
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your profile, organization, AI defaults, security and developer access." />
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Settings sections">
          {settingsSections.map((s) => (
            <button key={s.key} type="button" onClick={() => router.replace(`/settings?section=${s.key}`)} className={cn("whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors", section === s.key ? "bg-primary-soft font-medium text-foreground" : "text-foreground-secondary hover:bg-surface-2 hover:text-foreground")}>
              {s.label}
            </button>
          ))}
        </nav>
        <div className="min-w-0 animate-fade-in" key={section}>{render()}</div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return <Suspense><SettingsContent /></Suspense>;
}
