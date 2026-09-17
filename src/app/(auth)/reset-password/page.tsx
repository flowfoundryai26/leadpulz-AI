"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { services } from "@/services";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form";
import { AuthHeader, PasswordInput, PasswordStrength } from "@/components/auth/shared";
import { InlineAlert } from "@/components/ui/states";

const schema = z
  .object({
    password: z.string().min(8, "At least 8 characters").regex(/[0-9]/, "Include at least one number"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match" });
type Values = z.infer<typeof schema>;

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();
  const form = useForm<Values>({ resolver: zodResolver(schema) });

  if (!token) {
    return <InlineAlert tone="danger" title="Invalid or expired link">Request a new password reset link from the sign-in page.</InlineAlert>;
  }

  return (
    <form
      onSubmit={form.handleSubmit(async (v) => {
        await services.auth.resetPassword(token, v.password);
        toast.success("Password updated. Please sign in.");
        router.push("/login");
      })}
      className="space-y-4"
      noValidate
    >
      <Field label="New password" htmlFor="password" error={form.formState.errors.password?.message}>
        <PasswordInput id="password" autoComplete="new-password" {...form.register("password")} />
        <PasswordStrength value={form.watch("password") ?? ""} />
      </Field>
      <Field label="Confirm password" htmlFor="confirm" error={form.formState.errors.confirm?.message}>
        <PasswordInput id="confirm" autoComplete="new-password" {...form.register("confirm")} />
      </Field>
      <Button type="submit" className="w-full" size="lg" loading={form.formState.isSubmitting}>
        Update password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div>
      <AuthHeader title="Choose a new password" description="Make it at least 8 characters with a number. You'll be signed out of other devices." />
      <Suspense>
        <ResetForm />
      </Suspense>
    </div>
  );
}
