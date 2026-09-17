"use client";

import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/primitives";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      {children}
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: { background: "var(--lp-elevated)", border: "1px solid var(--lp-border)", color: "var(--lp-fg)" },
        }}
      />
    </TooltipProvider>
  );
}
