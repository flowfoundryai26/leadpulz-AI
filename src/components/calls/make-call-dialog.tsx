"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PhoneOutgoing } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form";
import { Input, Textarea } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { InlineAlert } from "@/components/ui/states";

export function MakeCallDialog({ open, onOpenChange, defaultPhone, defaultName }: { open: boolean; onOpenChange: (o: boolean) => void; defaultPhone?: string; defaultName?: string }) {
  const router = useRouter();
  const { data: agents } = useQuery(() => services.agents.list(), []);
  const [agentId, setAgentId] = useState("agt_maya");
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [objective, setObjective] = useState("Follow up on recent enquiry and offer consultation slots.");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setPending(true);
    setError(null);
    try {
      const call = await services.calls.startOutbound({ agentId, phone, objective });
      toast.success("Call started", { description: `Dialling ${phone} via ${call.agentName}` });
      onOpenChange(false);
      router.push(`/calls/live`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make a call</DialogTitle>
          <DialogDescription>An AI agent will place an outbound call right now{defaultName ? ` to ${defaultName}` : ""}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {error ? <InlineAlert tone="danger" title="Couldn't start the call">{error}</InlineAlert> : null}
          <Field label="AI agent">
            <SimpleSelect value={agentId} onValueChange={setAgentId} options={(agents ?? []).map((a) => ({ value: a.id, label: `${a.name}${a.status !== "active" ? ` (${a.status})` : ""}` }))} />
          </Field>
          <Field label="Phone number" required>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98480 12345" className="font-mono" />
          </Field>
          <Field label="Call objective" hint="Passed to the agent as context for this specific call.">
            <Textarea value={objective} onChange={(e) => setObjective(e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} loading={pending} disabled={!phone}>
            {!pending ? <PhoneOutgoing /> : null} Start call
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
