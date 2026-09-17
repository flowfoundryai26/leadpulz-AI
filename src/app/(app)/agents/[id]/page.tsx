import { Suspense } from "react";
import { AgentBuilder } from "@/components/agents/builder/agent-builder";
import { PageSkeleton } from "@/components/ui/states";

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AgentBuilder agentId={id} />
    </Suspense>
  );
}
