"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DateRangeKey } from "@/types";

interface AppState {
  organizationId: string;
  workspaceId: string;
  dateRange: DateRangeKey;
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  commandOpen: boolean;
  onboardingComplete: boolean;
  firstVisitSeen: boolean;
  setOrganization: (id: string) => void;
  setWorkspace: (id: string) => void;
  setDateRange: (r: DateRangeKey) => void;
  toggleSidebar: () => void;
  setMobileNavOpen: (open: boolean) => void;
  setCommandOpen: (open: boolean) => void;
  setOnboardingComplete: (v: boolean) => void;
  setFirstVisitSeen: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      organizationId: "org_apex",
      workspaceId: "ws_apex_main",
      dateRange: "30d",
      sidebarCollapsed: false,
      mobileNavOpen: false,
      commandOpen: false,
      onboardingComplete: true,
      firstVisitSeen: false,
      setOrganization: (organizationId) => set({ organizationId }),
      setWorkspace: (workspaceId) => set({ workspaceId }),
      setDateRange: (dateRange) => set({ dateRange }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
      setCommandOpen: (commandOpen) => set({ commandOpen }),
      setOnboardingComplete: (onboardingComplete) => set({ onboardingComplete }),
      setFirstVisitSeen: (firstVisitSeen) => set({ firstVisitSeen }),
    }),
    {
      name: "leadpulz-app",
      partialize: (s) => ({
        organizationId: s.organizationId,
        workspaceId: s.workspaceId,
        dateRange: s.dateRange,
        sidebarCollapsed: s.sidebarCollapsed,
        onboardingComplete: s.onboardingComplete,
        firstVisitSeen: s.firstVisitSeen,
      }),
    },
  ),
);
