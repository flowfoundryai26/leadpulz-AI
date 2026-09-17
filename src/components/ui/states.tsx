"use client";

import * as React from "react";
import { AlertTriangle, Inbox, RefreshCw, WifiOff, CreditCard, Plug, BookOpen, PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import type { ServiceError } from "@/services/types";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export function EmptyState({ icon, title, description, action, compact, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center", compact ? "px-6 py-12" : "px-6 py-20", className)}>
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
        <div className="relative flex size-14 items-center justify-center rounded-2xl border border-border bg-surface-2 text-primary [&_svg]:size-6">
          {icon ?? <Inbox />}
        </div>
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? <p className="mt-1.5 max-w-md text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

const errorMeta: Record<ServiceError["code"], { icon: React.ReactNode; title: string }> = {
  network: { icon: <WifiOff />, title: "You appear to be offline" },
  api: { icon: <AlertTriangle />, title: "Something went wrong" },
  provider: { icon: <PhoneOff />, title: "Call provider error" },
  integration: { icon: <Plug />, title: "Integration failure" },
  knowledge: { icon: <BookOpen />, title: "Knowledge processing failed" },
  billing: { icon: <CreditCard />, title: "Billing issue" },
  not_found: { icon: <Inbox />, title: "Not found" },
  unauthorized: { icon: <AlertTriangle />, title: "You don't have access" },
  validation: { icon: <AlertTriangle />, title: "Invalid input" },
};

export function ErrorState({ error, onRetry, compact, className }: { error: ServiceError | Error | null; onRetry?: () => void; compact?: boolean; className?: string }) {
  const code = (error as ServiceError)?.code ?? "api";
  const meta = errorMeta[code] ?? errorMeta.api;
  return (
    <div className={cn("flex flex-col items-center justify-center text-center rounded-2xl border border-danger/20 bg-danger-soft/40", compact ? "px-6 py-10" : "px-6 py-16", className)}>
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-danger/30 bg-danger-soft text-danger [&_svg]:size-5">{meta.icon}</div>
      <h3 className="text-base font-semibold text-foreground">{meta.title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-muted">{error?.message ?? "An unexpected error occurred."}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          <RefreshCw /> Try again
        </Button>
      ) : null}
    </div>
  );
}

export function InlineAlert({
  tone = "info",
  title,
  children,
  action,
  className,
}: {
  tone?: "info" | "warning" | "danger" | "success";
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const tones = {
    info: "border-accent/30 bg-accent-soft text-accent",
    warning: "border-warning/30 bg-warning-soft text-warning",
    danger: "border-danger/30 bg-danger-soft text-danger",
    success: "border-success/30 bg-success-soft text-success",
  }[tone];
  return (
    <div className={cn("flex items-start gap-3 rounded-xl border px-4 py-3 text-sm", tones, className)}>
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <div className="flex-1 text-foreground-secondary">
        {title ? <p className="font-medium text-foreground">{title}</p> : null}
        {children ? <div className="mt-0.5 text-[13px]">{children}</div> : null}
      </div>
      {action}
    </div>
  );
}

export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="lp-skeleton h-8 w-64 rounded-md" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="lp-skeleton h-28 rounded-2xl" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="lp-skeleton h-14 rounded-xl" />
      ))}
    </div>
  );
}
