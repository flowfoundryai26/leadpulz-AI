"use client";

import Link from "next/link";
import { Bot, Clock, Phone, PhoneCall } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";

export function UsageMeter({ className }: { className?: string }) {
  const { data, loading } = useQuery(() => services.billing.getUsage(), []);
  const pct = data ? (data.minutesUsed / data.minutesIncluded) * 100 : 0;
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle>Usage this period</CardTitle>
          <CardDescription>Growth plan · resets in 13 days</CardDescription>
        </div>
        <Button asChild variant="ghost" size="xs">
          <Link href="/billing">Manage</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading || !data ? (
          <>
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </>
        ) : (
          <>
            <Meter icon={<Clock />} label="AI Voice Minutes" value={`${formatNumber(data.minutesUsed)} / ${formatNumber(data.minutesIncluded)}`} pct={pct} tone={pct > 85 ? "warning" : "primary"} />
            <Meter icon={<PhoneCall />} label="Calls" value={formatNumber(data.calls)} />
            <Meter icon={<Bot />} label="Agents" value={`${data.agentsUsed} / ${data.agentsIncluded}`} pct={(data.agentsUsed / data.agentsIncluded) * 100} tone="accent" />
            <Meter icon={<Phone />} label="Phone Numbers" value={`${data.numbersUsed} / ${data.numbersIncluded}`} pct={(data.numbersUsed / data.numbersIncluded) * 100} tone="accent" />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Meter({ icon, label, value, pct, tone = "primary" }: { icon: React.ReactNode; label: string; value: string; pct?: number; tone?: "primary" | "accent" | "warning" }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-foreground-secondary [&_svg]:size-4 [&_svg]:text-muted">
          {icon}
          {label}
        </span>
        <span className="font-medium tabular-nums text-foreground">{value}</span>
      </div>
      {pct !== undefined ? <Progress value={pct} tone={tone} /> : null}
    </div>
  );
}
