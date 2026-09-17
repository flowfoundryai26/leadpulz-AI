import type { Organization, OrganizationMember, User, Workspace } from "@/types";
import { daysAgo, hoursAgo, minutesAgo } from "./time";

export const ORG_ID = "org_apex";
export const WORKSPACE_ID = "ws_apex_main";

export const currentUser: User = {
  id: "usr_sriharsha",
  fullName: "Sri Harsha",
  email: "sriharsha@apexdental.in",
  phone: "+91 98480 12345",
  country: "India",
  emailVerified: true,
  platformAdmin: true,
  createdAt: daysAgo(94),
};

export const organizations: Organization[] = [
  {
    id: ORG_ID,
    name: "Apex Dental Care",
    slug: "apex-dental",
    industry: "dental",
    website: "https://apexdentalcare.in",
    country: "India",
    timezone: "Asia/Kolkata",
    plan: "growth",
    parentOrganizationId: null,
    createdAt: daysAgo(94),
  },
  {
    id: "org_skyline",
    name: "Skyline Realty",
    slug: "skyline-realty",
    industry: "real_estate",
    website: "https://skylinerealty.in",
    country: "India",
    timezone: "Asia/Kolkata",
    plan: "professional",
    parentOrganizationId: null,
    createdAt: daysAgo(40),
  },
];

export const workspaces: Workspace[] = [
  { id: WORKSPACE_ID, organizationId: ORG_ID, name: "Hyderabad — Main Clinic", slug: "hyd-main", timezone: "Asia/Kolkata", isDefault: true },
  { id: "ws_apex_kukatpally", organizationId: ORG_ID, name: "Kukatpally Branch", slug: "kukatpally", timezone: "Asia/Kolkata", isDefault: false },
  { id: "ws_skyline_main", organizationId: "org_skyline", name: "Skyline — Sales", slug: "sales", timezone: "Asia/Kolkata", isDefault: true },
];

export const members: OrganizationMember[] = [
  {
    id: "mem_1",
    organizationId: ORG_ID,
    userId: currentUser.id,
    user: { fullName: "Sri Harsha", email: "sriharsha@apexdental.in" },
    role: "owner",
    status: "active",
    permissions: { agents: "all", analytics: true, billing: true },
    lastActiveAt: minutesAgo(1),
    joinedAt: daysAgo(94),
  },
  {
    id: "mem_2",
    organizationId: ORG_ID,
    userId: "usr_2",
    user: { fullName: "Dr. Kavya Nair", email: "kavya@apexdental.in" },
    role: "admin",
    status: "active",
    permissions: { agents: "all", analytics: true, billing: false },
    lastActiveAt: hoursAgo(2),
    joinedAt: daysAgo(90),
  },
  {
    id: "mem_3",
    organizationId: ORG_ID,
    userId: "usr_3",
    user: { fullName: "Ananya Iyer", email: "ananya@apexdental.in" },
    role: "manager",
    status: "active",
    permissions: { agents: "all", analytics: true, billing: false },
    lastActiveAt: hoursAgo(5),
    joinedAt: daysAgo(70),
  },
  {
    id: "mem_4",
    organizationId: ORG_ID,
    userId: "usr_4",
    user: { fullName: "Rohan Mehta", email: "rohan@apexdental.in" },
    role: "sales_rep",
    status: "active",
    permissions: { agents: "assigned", analytics: false, billing: false },
    lastActiveAt: daysAgo(1, 17, 40),
    joinedAt: daysAgo(45),
  },
  {
    id: "mem_5",
    organizationId: ORG_ID,
    userId: "usr_5",
    user: { fullName: "Meera Krishnan", email: "meera@apexdental.in" },
    role: "agent_manager",
    status: "active",
    permissions: { agents: "all", analytics: true, billing: false },
    lastActiveAt: daysAgo(2, 11, 15),
    joinedAt: daysAgo(30),
  },
  {
    id: "mem_6",
    organizationId: ORG_ID,
    userId: "usr_6",
    user: { fullName: "Vikram Desai", email: "vikram@apexdental.in" },
    role: "viewer",
    status: "invited",
    permissions: { agents: "none", analytics: true, billing: false },
    joinedAt: daysAgo(3),
  },
];
