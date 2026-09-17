"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { services } from "@/services";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import type { Lead, LeadSource } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(8, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  company: z.string().optional(),
  source: z.string(),
  serviceInterest: z.string().optional(),
  estimatedValue: z.string().optional(),
  tags: z.string().optional(),
});
type Values = z.infer<typeof schema>;

export function LeadDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: (lead: Lead) => void }) {
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { source: "manual", estimatedValue: "0" } });
  const e = form.formState.errors;

  const submit = async (v: Values) => {
    const lead = await services.leads.create({
      name: v.name,
      phone: v.phone,
      email: v.email || undefined,
      company: v.company || undefined,
      source: v.source as LeadSource,
      serviceInterest: v.serviceInterest,
      estimatedValue: Number(v.estimatedValue ?? 0) || 0,
      tags: v.tags ? v.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    });
    toast.success("Lead added", { description: `${lead.name} is now in your pipeline.` });
    form.reset();
    onOpenChange(false);
    onCreated(lead);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Add lead</DialogTitle>
          <DialogDescription>Manually add a lead. AI agents will enrich it after the first conversation.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(submit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Full name" required error={e.name?.message}><Input {...form.register("name")} placeholder="Rahul Sharma" /></Field>
          <Field label="Phone" required error={e.phone?.message}><Input {...form.register("phone")} placeholder="+91 98480 12345" className="font-mono" /></Field>
          <Field label="Email" error={e.email?.message}><Input {...form.register("email")} type="email" placeholder="name@example.com" /></Field>
          <Field label="Company"><Input {...form.register("company")} /></Field>
          <Field label="Source">
            <Controller control={form.control} name="source" render={({ field }) => <SimpleSelect value={field.value} onValueChange={field.onChange} options={[{ value: "manual", label: "Manual" }, { value: "website", label: "Website" }, { value: "referral", label: "Referral" }, { value: "whatsapp", label: "WhatsApp" }, { value: "campaign", label: "Campaign" }, { value: "import", label: "Import" }]} />} />
          </Field>
          <Field label="Service interest"><Input {...form.register("serviceInterest")} placeholder="Dental Implant" /></Field>
          <Field label="Estimated value (₹)"><Input {...form.register("estimatedValue")} type="number" /></Field>
          <Field label="Tags" hint="Comma separated"><Input {...form.register("tags")} placeholder="implants, banjara-hills" /></Field>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" loading={form.formState.isSubmitting}>Add lead</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
