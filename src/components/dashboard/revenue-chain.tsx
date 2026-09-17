import { MessageSquare, Brain, Filter, Database, Calendar, Repeat, IndianRupee, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { label: "Conversations", icon: MessageSquare },
  { label: "Intelligence", icon: Brain },
  { label: "Qualification", icon: Filter },
  { label: "CRM", icon: Database },
  { label: "Appointments", icon: Calendar },
  { label: "Follow-ups", icon: Repeat },
  { label: "Revenue", icon: IndianRupee },
];

/** Visual reinforcement of the LeadPulz product philosophy. */
export function RevenueChain({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-1.5">
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border border-border bg-surface/80 backdrop-blur px-3 py-2 text-xs font-medium text-foreground-secondary",
              i === steps.length - 1 && "border-accent/40 bg-accent-soft text-accent",
              i === 0 && "border-primary/40 bg-primary-soft text-[#c7c7ff]",
              compact && "px-2.5 py-1.5",
            )}
          >
            <s.icon className="size-3.5" />
            {s.label}
          </div>
          {i < steps.length - 1 ? <ChevronRight className="size-3.5 text-faint" /> : null}
        </div>
      ))}
    </div>
  );
}
