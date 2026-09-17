import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requirePlatformAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Platform Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requirePlatformAdmin();
  return <AdminShell>{children}</AdminShell>;
}
