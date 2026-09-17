import { CallDetail } from "@/components/calls/call-detail";

export default async function CallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CallDetail callId={id} />;
}
