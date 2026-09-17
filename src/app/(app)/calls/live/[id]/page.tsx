import { LiveCallDetail } from "@/components/calls/live-call-view";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LiveCallDetail callId={id} />;
}
