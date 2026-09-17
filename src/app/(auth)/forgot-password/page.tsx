"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import { services } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/form";
import { AuthHeader } from "@/components/auth/shared";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState<string | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(schema) });

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-success-soft text-success">
          <MailCheck className="size-6" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Check your inbox</h2>
        <p className="mt-2 text-sm text-muted">
          We sent a password reset link to <span className="font-medium text-foreground">{sent}</span>. The link expires in 30 minutes.
        </p>
        <Button asChild variant="secondary" className="mt-6">
          <Link href="/reset-password?token=demo">Open reset link (demo)</Link>
        </Button>
        <p className="mt-6 text-sm text-muted">
          Didn&apos;t get it?{" "}
          <button type="button" className="font-medium text-[#a3a3ff] hover:underline" onClick={() => services.auth.requestPasswordReset(sent)}>
            Resend email
          </button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <AuthHeader title="Reset your password" description="Enter the email associated with your account and we'll send you a reset link." />
      <form
        onSubmit={form.handleSubmit(async (v) => {
          await services.auth.requestPasswordReset(v.email);
          setSent(v.email);
        })}
        className="space-y-4"
        noValidate
      >
        <Field label="Email" htmlFor="email" error={form.formState.errors.email?.message}>
          <Input id="email" type="email" placeholder="you@company.com" leftIcon={<Mail />} {...form.register("email")} />
        </Field>
        <Button type="submit" className="w-full" size="lg" loading={form.formState.isSubmitting}>
          Send reset link
        </Button>
      </form>
      <Link href="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to sign in
      </Link>
    </div>
  );
}
