"use client";

import { Suspense, useState } from "react";
import { PhoneOutgoing } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { CallsTable } from "@/components/calls/calls-table";
import { MakeCallDialog } from "@/components/calls/make-call-dialog";
import { PageSkeleton } from "@/components/ui/states";

export default function CallsPage() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <PageHeader
        title="Calls"
        description="Every conversation your AI agents have handled — with recordings, transcripts and AI summaries."
        actions={
          <Button onClick={() => setOpen(true)}>
            <PhoneOutgoing /> Make Call
          </Button>
        }
      />
      <Suspense fallback={<PageSkeleton />}>
        <CallsTable />
      </Suspense>
      <MakeCallDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
