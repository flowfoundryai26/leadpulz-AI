import { LeadProfile } from "@/components/leads/lead-profile";

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LeadProfile leadId={id} />;
}
