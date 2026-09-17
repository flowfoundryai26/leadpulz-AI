import type {
  AdminOrgRow,
  AgentPerformance,
  ConversationIntelligence,
  DateRangeKey,
  FunnelStage,
  Insight,
  KpiValue,
  SeriesPoint,
  SystemHealth,
} from "@/types";
import { seeded } from "@/lib/utils";
import { format } from "date-fns";
import { daysAgo, NOW } from "./time";

/** KPI sets per date range — realistic, with previous-period comparisons. */
const kpiByRange: Record<DateRangeKey, KpiValue[]> = {
  "30d": [
    { key: "total_calls", label: "Total Calls", value: 1_284, previous: 1_102, format: "number" },
    { key: "answered_calls", label: "Answered Calls", value: 1_197, previous: 998, format: "number" },
    { key: "leads", label: "Leads Generated", value: 612, previous: 540, format: "number" },
    { key: "qualified", label: "Qualified Leads", value: 326, previous: 271, format: "number" },
    { key: "appointments", label: "Appointments Booked", value: 148, previous: 121, format: "number" },
    { key: "conversion", label: "Conversion Rate", value: 25.4, previous: 22.4, format: "percent" },
    { key: "avg_duration", label: "Avg. Call Duration", value: 214, previous: 226, format: "duration" },
    { key: "revenue", label: "Estimated Revenue", value: 8_42_500, previous: 7_08_200, format: "currency" },
  ],
  "7d": [
    { key: "total_calls", label: "Total Calls", value: 318, previous: 287, format: "number" },
    { key: "answered_calls", label: "Answered Calls", value: 296, previous: 260, format: "number" },
    { key: "leads", label: "Leads Generated", value: 152, previous: 139, format: "number" },
    { key: "qualified", label: "Qualified Leads", value: 84, previous: 70, format: "number" },
    { key: "appointments", label: "Appointments Booked", value: 39, previous: 31, format: "number" },
    { key: "conversion", label: "Conversion Rate", value: 26.4, previous: 22.3, format: "percent" },
    { key: "avg_duration", label: "Avg. Call Duration", value: 208, previous: 219, format: "duration" },
    { key: "revenue", label: "Estimated Revenue", value: 2_16_800, previous: 1_74_300, format: "currency" },
  ],
  today: [
    { key: "total_calls", label: "Total Calls", value: 93, previous: 81, format: "number" },
    { key: "answered_calls", label: "Answered Calls", value: 88, previous: 74, format: "number" },
    { key: "leads", label: "Leads Generated", value: 41, previous: 36, format: "number" },
    { key: "qualified", label: "Qualified Leads", value: 22, previous: 17, format: "number" },
    { key: "appointments", label: "Appointments Booked", value: 11, previous: 8, format: "number" },
    { key: "conversion", label: "Conversion Rate", value: 26.8, previous: 22.2, format: "percent" },
    { key: "avg_duration", label: "Avg. Call Duration", value: 201, previous: 215, format: "duration" },
    { key: "revenue", label: "Estimated Revenue", value: 62_400, previous: 48_900, format: "currency" },
  ],
  yesterday: [
    { key: "total_calls", label: "Total Calls", value: 81, previous: 77, format: "number" },
    { key: "answered_calls", label: "Answered Calls", value: 74, previous: 70, format: "number" },
    { key: "leads", label: "Leads Generated", value: 36, previous: 33, format: "number" },
    { key: "qualified", label: "Qualified Leads", value: 17, previous: 16, format: "number" },
    { key: "appointments", label: "Appointments Booked", value: 8, previous: 9, format: "number" },
    { key: "conversion", label: "Conversion Rate", value: 22.2, previous: 24.1, format: "percent" },
    { key: "avg_duration", label: "Avg. Call Duration", value: 215, previous: 209, format: "duration" },
    { key: "revenue", label: "Estimated Revenue", value: 48_900, previous: 51_200, format: "currency" },
  ],
  custom: [],
};
kpiByRange.custom = kpiByRange["30d"];

export function getKpis(range: DateRangeKey): KpiValue[] {
  return kpiByRange[range];
}

const rand = seeded(9001);
function buildSeries(days: number, hourly = false): SeriesPoint[] {
  const points: SeriesPoint[] = [];
  const n = hourly ? 12 : days;
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(NOW);
    if (hourly) d.setHours(8 + (n - 1 - i), 0, 0, 0);
    else d.setDate(d.getDate() - i);
    const weekday = d.getDay();
    const weekendDip = weekday === 0 ? 0.45 : weekday === 6 ? 0.7 : 1;
    const base = hourly ? 6 + rand() * 6 : 28 + rand() * 18;
    const inbound = Math.round(base * weekendDip);
    const outbound = Math.round((hourly ? 3 + rand() * 4 : 10 + rand() * 9) * weekendDip);
    const qualified = Math.round((inbound + outbound) * (0.22 + rand() * 0.1));
    const bookings = Math.round(qualified * (0.4 + rand() * 0.15));
    points.push({
      date: d.toISOString(),
      label: hourly ? format(d, "h a") : format(d, "dd MMM"),
      inbound,
      outbound,
      qualified,
      bookings,
    });
  }
  return points;
}

const seriesByRange: Record<DateRangeKey, SeriesPoint[]> = {
  today: buildSeries(1, true),
  yesterday: buildSeries(1, true),
  "7d": buildSeries(7),
  "30d": buildSeries(30),
  custom: buildSeries(14),
};

export function getCallSeries(range: DateRangeKey): SeriesPoint[] {
  return seriesByRange[range];
}

export const funnel: FunnelStage[] = [
  { key: "calls", label: "Calls", value: 1_284 },
  { key: "conversations", label: "Conversations", value: 1_197 },
  { key: "leads", label: "Leads", value: 612 },
  { key: "qualified", label: "Qualified Leads", value: 326 },
  { key: "appointments", label: "Appointments", value: 148 },
  { key: "customers", label: "Customers", value: 89 },
];

export const insights: Insight[] = [
  { id: "ins_1", kind: "trend", text: "42 callers asked about pricing this week — up 18% from last week.", metric: "+18%", actionLabel: "View questions", actionHref: "/analytics?tab=intelligence" },
  { id: "ins_2", kind: "opportunity", text: "Customers mentioning emergency service convert 2.3× more often. Consider a dedicated emergency flow.", metric: "2.3×", actionLabel: "Edit Maya's flow", actionHref: "/agents/agt_maya?tab=flow" },
  { id: "ins_3", kind: "warning", text: "18 qualified leads did not book appointments in the last 7 days.", metric: "18 leads", actionLabel: "View leads", actionHref: "/leads?stage=qualified" },
  { id: "ins_4", kind: "recommendation", text: "Create an automated follow-up workflow for unbooked qualified leads — similar clinics recover 31% of them.", actionLabel: "Create workflow", actionHref: "/workflows/new" },
  { id: "ins_5", kind: "trend", text: "Hindi-language calls grew 26% this month. Maya handles them with a 91% resolution rate.", metric: "+26%" },
];

export const agentLeaderboard: AgentPerformance[] = [
  { agentId: "agt_maya", agentName: "Maya — Dental Receptionist", calls: 782, qualifiedLeads: 244, appointments: 118, conversionRate: 31.2, revenue: 4_38_000, avgDurationSec: 214, resolutionRate: 88.4 },
  { agentId: "agt_arjun", agentName: "Arjun — Real Estate Lead Agent", calls: 316, qualifiedLeads: 72, appointments: 26, conversionRate: 22.8, revenue: 2_20_000, avgDurationSec: 262, resolutionRate: 79.1 },
  { agentId: "agt_nisha", agentName: "Nisha — Customer Support Agent", calls: 142, qualifiedLeads: 6, appointments: 2, conversionRate: 8.4, revenue: 84_500, avgDurationSec: 176, resolutionRate: 93.6 },
  { agentId: "agt_ravi", agentName: "Ravi — Lead Follow-up Agent", calls: 44, qualifiedLeads: 4, appointments: 2, conversionRate: 18.9, revenue: 1_00_000, avgDurationSec: 148, resolutionRate: 71.2 },
];

export const conversationIntelligence: ConversationIntelligence = {
  commonQuestions: [
    { label: "How much does a dental implant cost?", count: 142, delta: 12 },
    { label: "Do you accept insurance?", count: 98, delta: -4 },
    { label: "Is EMI available?", count: 81, delta: 22 },
    { label: "What are your clinic timings?", count: 77, delta: 3 },
    { label: "Do you have a clinic near Kukatpally?", count: 64, delta: 9 },
    { label: "How long does aligner treatment take?", count: 52, delta: 15 },
  ],
  objections: [
    { label: "Price is too high", count: 88, delta: 6 },
    { label: "Need to consult family", count: 61, delta: -2 },
    { label: "Comparing with another clinic", count: 39, delta: 4 },
    { label: "Not the right time", count: 33, delta: -8 },
    { label: "Prefer a human to call back", count: 21, delta: -5 },
  ],
  intents: [
    { label: "Book appointment", count: 412 },
    { label: "Pricing enquiry", count: 318 },
    { label: "Treatment information", count: 226 },
    { label: "Reschedule / cancel", count: 134 },
    { label: "Post-treatment support", count: 98 },
    { label: "Insurance / billing", count: 76 },
  ],
  sentiment: { positive: 64, neutral: 27, negative: 9 },
  lostReasons: [
    { label: "Price", count: 46 },
    { label: "Chose competitor", count: 22 },
    { label: "No response to follow-up", count: 31 },
    { label: "Location too far", count: 14 },
    { label: "Treatment not offered", count: 6 },
  ],
  bookingReasons: [
    { label: "Immediate availability", count: 71 },
    { label: "Free consultation", count: 58 },
    { label: "EMI option", count: 43 },
    { label: "Doctor reputation", count: 37 },
    { label: "Proximity", count: 29 },
  ],
  serviceDemand: [
    { label: "Dental Implants", count: 218, delta: 14 },
    { label: "Aligners / Braces", count: 164, delta: 21 },
    { label: "Teeth Whitening", count: 122, delta: 8 },
    { label: "Root Canal", count: 96, delta: -3 },
    { label: "Routine Check-up", count: 88, delta: 2 },
    { label: "Pediatric", count: 41, delta: 6 },
  ],
  topics: [
    { label: "Pricing", count: 318 },
    { label: "Availability", count: 254 },
    { label: "Treatment duration", count: 141 },
    { label: "Pain / anaesthesia", count: 96 },
    { label: "Insurance", count: 76 },
    { label: "Parking / location", count: 44 },
  ],
  keywordTrends: [
    { label: "emergency", count: 64, delta: 38 },
    { label: "EMI", count: 81, delta: 22 },
    { label: "aligners", count: 112, delta: 19 },
    { label: "Diwali offer", count: 27, delta: 27 },
    { label: "whitening", count: 122, delta: 8 },
    { label: "insurance", count: 76, delta: -4 },
  ],
};

/* ───────── Admin platform ───────── */

export const adminOrgs: AdminOrgRow[] = [
  { id: "org_apex", name: "Apex Dental Care", industry: "dental", plan: "growth", status: "active", agents: 4, monthlyCalls: 1_284, minutes: 3_420, mrr: 14_999, createdAt: daysAgo(94), country: "IN" },
  { id: "org_skyline", name: "Skyline Realty", industry: "real_estate", plan: "professional", status: "active", agents: 6, monthlyCalls: 3_102, minutes: 9_840, mrr: 39_999, createdAt: daysAgo(40), country: "IN" },
  { id: "org_coolbreeze", name: "CoolBreeze HVAC", industry: "hvac", plan: "growth", status: "active", agents: 2, monthlyCalls: 812, minutes: 2_110, mrr: 14_999, createdAt: daysAgo(62), country: "IN" },
  { id: "org_glow", name: "Glow Salon & Spa", industry: "salon", plan: "starter", status: "trialing", agents: 1, monthlyCalls: 214, minutes: 380, mrr: 0, createdAt: daysAgo(9), country: "IN" },
  { id: "org_spice", name: "Spice Route Restaurants", industry: "restaurant", plan: "growth", status: "active", agents: 3, monthlyCalls: 1_920, minutes: 2_460, mrr: 14_999, createdAt: daysAgo(120), country: "AE" },
  { id: "org_talent", name: "TalentBridge Recruitment", industry: "recruitment", plan: "professional", status: "past_due", agents: 8, monthlyCalls: 4_410, minutes: 12_200, mrr: 39_999, createdAt: daysAgo(150), country: "IN" },
  { id: "org_autocare", name: "AutoCare Service Hub", industry: "automotive", plan: "starter", status: "active", agents: 1, monthlyCalls: 402, minutes: 760, mrr: 4_999, createdAt: daysAgo(33), country: "IN" },
  { id: "org_medicity", name: "MediCity Clinics", industry: "healthcare", plan: "enterprise", status: "active", agents: 14, monthlyCalls: 9_860, minutes: 28_400, mrr: 1_20_000, createdAt: daysAgo(210), country: "IN" },
  { id: "org_secure", name: "SecureLife Insurance", industry: "insurance", plan: "growth", status: "churned", agents: 0, monthlyCalls: 0, minutes: 0, mrr: 0, createdAt: daysAgo(180), country: "SG" },
  { id: "org_growthlab", name: "GrowthLab Agency", industry: "agency", plan: "enterprise", status: "active", agents: 22, monthlyCalls: 7_120, minutes: 19_300, mrr: 95_000, createdAt: daysAgo(160), country: "US" },
];

export const systemHealth: SystemHealth[] = [
  { service: "Voice Gateway", status: "operational", latencyMs: 142, uptime: 99.98, errorRate: 0.04 },
  { service: "LLM Orchestrator", status: "operational", latencyMs: 610, uptime: 99.95, errorRate: 0.11 },
  { service: "Speech-to-Text", status: "operational", latencyMs: 228, uptime: 99.97, errorRate: 0.06 },
  { service: "Text-to-Speech", status: "degraded", latencyMs: 890, uptime: 99.62, errorRate: 1.24 },
  { service: "Telephony (Twilio)", status: "operational", latencyMs: 96, uptime: 99.99, errorRate: 0.02 },
  { service: "Knowledge Indexer", status: "operational", latencyMs: 1_240, uptime: 99.9, errorRate: 0.3 },
  { service: "Webhook Dispatcher", status: "operational", latencyMs: 74, uptime: 99.99, errorRate: 0.4 },
  { service: "Public API", status: "operational", latencyMs: 58, uptime: 99.99, errorRate: 0.08 },
];

export const adminKpis = [
  { key: "orgs", label: "Total Organizations", value: 312, previous: 284, format: "number" as const },
  { key: "active", label: "Active Customers", value: 241, previous: 219, format: "number" as const },
  { key: "agents", label: "Active Agents", value: 1_146, previous: 1_020, format: "number" as const },
  { key: "calls", label: "Monthly Calls", value: 184_920, previous: 161_400, format: "number" as const },
  { key: "minutes", label: "Voice Minutes", value: 512_340, previous: 448_100, format: "number" as const },
  { key: "revenue", label: "Platform Revenue (MRR)", value: 62_40_000, previous: 55_10_000, format: "currency" as const },
  { key: "errors", label: "API Errors (24h)", value: 38, previous: 52, format: "number" as const },
  { key: "success", label: "Call Success Rate", value: 98.4, previous: 98.1, format: "percent" as const },
];

export const platformSeries = Array.from({ length: 12 }).map((_, i) => {
  const d = new Date(NOW);
  d.setMonth(d.getMonth() - (11 - i));
  return {
    label: format(d, "MMM"),
    mrr: Math.round(18_00_000 + i * 4_10_000 + rand() * 1_50_000),
    calls: Math.round(52_000 + i * 12_000 + rand() * 8_000),
    orgs: Math.round(96 + i * 19 + rand() * 6),
  };
});

export const revenueByPlan = [
  { label: "Starter", value: 4_20_000 },
  { label: "Growth", value: 18_60_000 },
  { label: "Professional", value: 21_80_000 },
  { label: "Enterprise", value: 17_80_000 },
];

export const costMetrics = {
  costPerLead: 43,
  costPerAppointment: 116,
  aiResolutionRate: 87.2,
  answeredRate: 93.2,
};

export { daysAgo };
