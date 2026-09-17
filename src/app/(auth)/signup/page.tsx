"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Mail, Phone, User } from "lucide-react";
import { services } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/form";
import { SimpleSelect } from "@/components/ui/select";
import { COUNTRIES } from "@/lib/constants";
import { AuthHeader, OrDivider, PasswordInput, PasswordStrength, SocialAuth } from "@/components/auth/shared";

const schema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  businessName: z.string().min(2, "Enter your business name"),
  email: z.string().email("Enter a valid work email").refine((e) => !/@(gmail|yahoo|hotmail|outlook)\./i.test(e), "Please use your work email"),
  password: z.string().min(8, "At least 8 characters").regex(/[0-9]/, "Include at least one number"),
  country: z.string().min(1, "Select your country"),
  phone: z.string().min(8, "Enter a valid phone number"),
});
type Values = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { country: "India" } });

  const onSubmit = async (values: Values) => {
    await services.auth.signUp(values);
    router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
  };
  const e = form.formState.errors;

  return (
    <div>
      <AuthHeader title="Create your account" description="Start with a 14-day free trial. No credit card required." />
      <SocialAuth mode="signup" />
      <OrDivider label="or sign up with email" />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="fullName" error={e.fullName?.message} required>
            <Input id="fullName" autoComplete="name" placeholder="Sri Harsha" leftIcon={<User />} invalid={!!e.fullName} {...form.register("fullName")} />
          </Field>
          <Field label="Business name" htmlFor="businessName" error={e.businessName?.message} required>
            <Input id="businessName" autoComplete="organization" placeholder="Apex Dental Care" leftIcon={<Building2 />} invalid={!!e.businessName} {...form.register("businessName")} />
          </Field>
        </div>
        <Field label="Work email" htmlFor="email" error={e.email?.message} required>
          <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" leftIcon={<Mail />} invalid={!!e.email} {...form.register("email")} />
        </Field>
        <Field label="Password" htmlFor="password" error={e.password?.message} required>
          <PasswordInput id="password" autoComplete="new-password" placeholder="Create a strong password" invalid={!!e.password} {...form.register("password")} />
          <PasswordStrength value={form.watch("password") ?? ""} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Country" error={e.country?.message} required>
            <Controller control={form.control} name="country" render={({ field }) => <SimpleSelect value={field.value} onValueChange={field.onChange} options={COUNTRIES.map((c) => ({ value: c, label: c }))} placeholder="Select country" />} />
          </Field>
          <Field label="Phone number" htmlFor="phone" error={e.phone?.message} required>
            <Input id="phone" type="tel" autoComplete="tel" placeholder="+91 98480 12345" leftIcon={<Phone />} invalid={!!e.phone} {...form.register("phone")} />
          </Field>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={form.formState.isSubmitting}>
          Create account
        </Button>
        <p className="text-center text-[11px] leading-relaxed text-faint">
          By continuing you agree to the LeadPulz <Link href="/help#terms" className="underline">Terms of Service</Link> and <Link href="/help#privacy" className="underline">Privacy Policy</Link>.
        </p>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#a3a3ff] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
