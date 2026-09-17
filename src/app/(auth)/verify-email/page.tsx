"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { MailOpen } from "lucide-react";
import { services } from "@/services";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";

function CodeInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  return (
    <div className="flex justify-center gap-2">
      {value.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={d}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(-1);
            const next = [...value];
            next[i] = v;
            onChange(next);
            if (v && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (text.length === 6) {
              onChange(text.split(""));
              refs.current[5]?.focus();
              e.preventDefault();
            }
          }}
          className="size-12 rounded-lg border border-border bg-background-subtle text-center text-lg font-semibold text-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/25"
        />
      ))}
    </div>
  );
}

function VerifyForm() {
  const params = useSearchParams();
  const email = params.get("email") ?? "your email";
  const router = useRouter();
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [pending, setPending] = useState(false);
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);

  const verify = async () => {
    setPending(true);
    try {
      await services.auth.verifyEmail(code.join(""));
      setOnboardingComplete(false);
      toast.success("Email verified");
      router.push("/onboarding");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-[#a3a3ff]">
        <MailOpen className="size-6" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">Verify your email</h2>
      <p className="mt-2 text-sm text-muted">
        We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>. Enter it below to continue.
      </p>
      <div className="mt-8">
        <CodeInput value={code} onChange={setCode} />
      </div>
      <Button className="mt-6 w-full" size="lg" onClick={verify} loading={pending} disabled={code.some((d) => !d)}>
        Verify and continue
      </Button>
      <p className="mt-5 text-sm text-muted">
        Didn&apos;t receive it?{" "}
        <button
          type="button"
          className="font-medium text-[#a3a3ff] hover:underline"
          onClick={async () => {
            await services.auth.resendVerification(email);
            toast.success("Verification code resent");
          }}
        >
          Resend code
        </button>
      </p>
      <p className="mt-2 text-xs text-faint">Demo: any 6 digits will work.</p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
