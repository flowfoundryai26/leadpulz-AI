"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { services } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/primitives";
import { AuthHeader, OrDivider, PasswordInput, SocialAuth } from "@/components/auth/shared";

const schema = z.object({
  email: z.string().email("Enter a valid work email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});
type Values = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "sriharsha@apexdental.in", password: "demo-password", remember: true } });

  const onSubmit = async (values: Values) => {
    try {
      const { onboarded } = await services.auth.signIn(values);
      toast.success("Welcome back");
      router.push(onboarded ? "/dashboard" : "/onboarding");
    } catch (e) {
      form.setError("password", { message: (e as Error).message });
    }
  };

  return (
    <div>
      <AuthHeader title="Sign in to LeadPulz" description="Your AI revenue agents have been busy. Let's see what they've done." />
      <SocialAuth mode="login" />
      <OrDivider />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Work email" htmlFor="email" error={form.formState.errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" leftIcon={<Mail />} invalid={!!form.formState.errors.email} {...form.register("email")} />
        </Field>
        <Field
          label={
            <span className="flex w-full items-center justify-between">
              Password
              <Link href="/forgot-password" className="text-xs font-normal text-[#a3a3ff] hover:underline">
                Forgot password?
              </Link>
            </span>
          }
          htmlFor="password"
          error={form.formState.errors.password?.message}
        >
          <PasswordInput id="password" autoComplete="current-password" placeholder="••••••••" invalid={!!form.formState.errors.password} {...form.register("password")} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-foreground-secondary">
          <Checkbox checked={form.watch("remember")} onCheckedChange={(v) => form.setValue("remember", !!v)} /> Keep me signed in for 30 days
        </label>
        <Button type="submit" className="w-full" size="lg" loading={form.formState.isSubmitting}>
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        New to LeadPulz?{" "}
        <Link href="/signup" className="font-medium text-[#a3a3ff] hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
