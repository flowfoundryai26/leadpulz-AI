import { cn } from "@/lib/utils";

export function LogoMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={cn("shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id="lp-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6161FF" />
          <stop offset="1" stopColor="#3AC9FF" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#lp-grad)" />
      {/* pulse waveform */}
      <path d="M6 17h4l2.5-6 3.5 12 3-9 2 3h5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function Logo({ className, collapsed, light }: { className?: string; collapsed?: boolean; light?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {!collapsed ? (
        <span className={cn("text-[17px] font-semibold tracking-tight", light ? "text-white" : "text-foreground")}>
          LeadPulz<span className="text-accent"> AI</span>
        </span>
      ) : null}
    </div>
  );
}
