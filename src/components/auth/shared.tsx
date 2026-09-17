"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { services } from "@/services";
import { cn } from "@/lib/utils";

export function AuthHeader({ title, description }: { title: string; description?: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {description ? <p className="mt-1.5 text-sm text-muted">{description}</p> : null}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}
function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <rect x="2" y="2" width="9.5" height="9.5" fill="#F25022" />
      <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7FBA00" />
      <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#FFB900" />
    </svg>
  );
}

export function SocialAuth({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [pending, setPending] = useState<"google" | "microsoft" | null>(null);
  const go = async (provider: "google" | "microsoft") => {
    setPending(provider);
    try {
      const { onboarded } = await services.auth.signInWithProvider(provider);
      router.push(mode === "signup" || !onboarded ? "/onboarding" : "/dashboard");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setPending(null);
    }
  };
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button type="button" variant="secondary" onClick={() => go("google")} loading={pending === "google"}>
        {pending !== "google" ? <GoogleIcon /> : null} Google
      </Button>
      <Button type="button" variant="secondary" onClick={() => go("microsoft")} loading={pending === "microsoft"}>
        {pending !== "microsoft" ? <MicrosoftIcon /> : null} Microsoft
      </Button>
    </div>
  );
}

export function OrDivider({ label = "or continue with email" }: { label?: string }) {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-faint">
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false);
  return (
    <Input
      {...props}
      type={show ? "text" : "password"}
      rightIcon={
        <button type="button" onClick={() => setShow((s) => !s)} className="text-muted hover:text-foreground" aria-label={show ? "Hide password" : "Show password"} tabIndex={-1}>
          {show ? <EyeOff /> : <Eye />}
        </button>
      }
    />
  );
}

export function PasswordStrength({ value }: { value: string }) {
  const score = [value.length >= 8, /[A-Z]/.test(value), /[0-9]/.test(value), /[^A-Za-z0-9]/.test(value)].filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!value) return null;
  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={cn("h-1 flex-1 rounded-full bg-border transition-colors", i <= score && (score <= 1 ? "bg-danger" : score === 2 ? "bg-warning" : "bg-success"))} />
        ))}
      </div>
      <p className="mt-1 text-[11px] text-muted">{labels[score]} password</p>
    </div>
  );
}
