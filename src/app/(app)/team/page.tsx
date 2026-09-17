"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, MoreHorizontal, Shield, Trash2, UserPlus, Check, X } from "lucide-react";
import { services } from "@/services";
import { useQuery } from "@/hooks/use-query";
import { useAppStore } from "@/store/app-store";
import type { OrganizationMember, OrgRole } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Avatar } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SimpleSelect } from "@/components/ui/select";
import { ErrorState } from "@/components/ui/states";
import { ROLES, ROLE_LABEL } from "@/lib/constants";
import { timeAgo } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const matrix: Array<{ label: string; roles: Record<OrgRole, boolean> }> = [
  { label: "View dashboards & analytics", roles: { owner: true, admin: true, manager: true, agent_manager: true, sales_rep: false, viewer: true } },
  { label: "Build & edit AI agents", roles: { owner: true, admin: true, manager: true, agent_manager: true, sales_rep: false, viewer: false } },
  { label: "Access assigned agents only", roles: { owner: false, admin: false, manager: false, agent_manager: false, sales_rep: true, viewer: false } },
  { label: "Work leads, calls & appointments", roles: { owner: true, admin: true, manager: true, agent_manager: false, sales_rep: true, viewer: false } },
  { label: "Run campaigns & workflows", roles: { owner: true, admin: true, manager: true, agent_manager: false, sales_rep: false, viewer: false } },
  { label: "Manage team & roles", roles: { owner: true, admin: true, manager: true, agent_manager: false, sales_rep: false, viewer: false } },
  { label: "Billing & plan changes", roles: { owner: true, admin: true, manager: false, agent_manager: false, sales_rep: false, viewer: false } },
  { label: "API keys & security", roles: { owner: true, admin: true, manager: false, agent_manager: false, sales_rep: false, viewer: false } },
];

export default function TeamPage() {
  const orgId = useAppStore((s) => s.organizationId);
  const { data, loading, error, refetch } = useQuery(() => services.tenant.getMembers(orgId), [orgId]);
  const [invite, setInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrgRole>("sales_rep");
  const [pending, setPending] = useState(false);

  const send = async () => {
    setPending(true);
    await services.tenant.inviteMember(orgId, { email, role });
    setPending(false);
    setInvite(false);
    setEmail("");
    toast.success("Invitation sent", { description: `${email} will receive an email to join as ${ROLE_LABEL[role]}.` });
    refetch();
  };

  const columns: Column<OrganizationMember>[] = [
    { key: "member", header: "Member", sortValue: (m) => m.user.fullName, cell: (m) => <div className="flex items-center gap-3"><Avatar name={m.user.fullName} size="sm" /><div><p className="font-medium">{m.user.fullName}</p><p className="text-xs text-muted">{m.user.email}</p></div></div> },
    { key: "role", header: "Role", sortValue: (m) => m.role, cell: (m) => <Badge variant={m.role === "owner" ? "primary" : "default"}><Shield className="size-3" />{ROLE_LABEL[m.role]}</Badge> },
    { key: "agents", header: "Agent access", cell: (m) => <span className="text-xs capitalize text-foreground-secondary">{m.permissions.agents}</span> },
    { key: "analytics", header: "Analytics", cell: (m) => m.permissions.analytics ? <Check className="size-4 text-success" /> : <X className="size-4 text-faint" /> },
    { key: "billing", header: "Billing", cell: (m) => m.permissions.billing ? <Check className="size-4 text-success" /> : <X className="size-4 text-faint" /> },
    { key: "status", header: "Status", cell: (m) => m.status === "active" ? <Badge variant="success" dot>Active</Badge> : m.status === "invited" ? <Badge variant="warning" dot>Invited</Badge> : <Badge variant="danger">Suspended</Badge> },
    { key: "last", header: "Last active", sortValue: (m) => m.lastActiveAt ?? "", cell: (m) => <span className="text-xs text-muted" suppressHydrationWarning>{m.lastActiveAt ? timeAgo(m.lastActiveAt) : "—"}</span> },
    { key: "actions", header: "", className: "text-right", cell: (m) => m.role === "owner" ? null : (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="Member actions"><MoreHorizontal /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Change role</DropdownMenuLabel>
          {ROLES.filter((r) => r.value !== "owner").map((r) => <DropdownMenuItem key={r.value} onClick={async () => { await services.tenant.updateMemberRole(m.id, r.value); toast.success(`Role changed to ${r.label}`); refetch(); }}>{r.label}{m.role === r.value ? <Check className="ml-auto !text-primary" /> : null}</DropdownMenuItem>)}
          <DropdownMenuSeparator />
          {m.status === "invited" ? <DropdownMenuItem onClick={() => toast.success("Invitation resent")}><Mail /> Resend invite</DropdownMenuItem> : null}
          <DropdownMenuItem destructive onClick={async () => { await services.tenant.removeMember(m.id); toast.success("Member removed"); refetch(); }}><Trash2 /> Remove</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) },
  ];

  return (
    <div>
      <PageHeader title="Team" description={`${data?.length ?? 0} members · Growth plan includes 10 seats.`} actions={<Button onClick={() => setInvite(true)}><UserPlus /> Invite Member</Button>} />
      {error ? <ErrorState error={error} onRetry={refetch} /> : <DataTable columns={columns} rows={data} rowKey={(m) => m.id} loading={loading} />}
      <Card className="mt-8">
        <CardHeader><CardTitle>Role permissions</CardTitle><CardDescription>What each role can do. Owner and Admin can further restrict agent access, analytics and billing per member.</CardDescription></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Permission</TableHead>{ROLES.map((r) => <TableHead key={r.value} className="text-center">{r.label}</TableHead>)}</TableRow></TableHeader>
            <TableBody>
              {matrix.map((row) => <TableRow key={row.label}><TableCell className="text-foreground-secondary">{row.label}</TableCell>{ROLES.map((r) => <TableCell key={r.value} className="text-center">{row.roles[r.value] ? <Check className="mx-auto size-4 text-success" /> : <X className="mx-auto size-4 text-faint" />}</TableCell>)}</TableRow>)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={invite} onOpenChange={setInvite}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite a team member</DialogTitle><DialogDescription>They&apos;ll get an email link to join {`this organization`}.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <Field label="Work email" required><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" leftIcon={<Mail />} /></Field>
            <Field label="Role" hint={ROLES.find((r) => r.value === role)?.description}><SimpleSelect value={role} onValueChange={(v) => setRole(v as OrgRole)} options={ROLES.filter((r) => r.value !== "owner").map((r) => ({ value: r.value, label: r.label }))} /></Field>
          </div>
          <DialogFooter><Button variant="secondary" onClick={() => setInvite(false)}>Cancel</Button><Button onClick={send} loading={pending} disabled={!email.includes("@")}>Send invitation</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
