import type {
  ApiKey,
  AuditLog,
  Integration,
  Invoice,
  KnowledgeBase,
  KnowledgeDocument,
  Notification,
  PhoneNumber,
  Plan,
  Subscription,
  Usage,
  WebhookEndpoint,
  WebhookLog,
} from "@/types";
import { ORG_ID } from "./org";
import { daysAgo, daysFromNow, hoursAgo, minutesAgo } from "./time";

export const phoneNumbers: PhoneNumber[] = [
  { id: "pn_1", organizationId: ORG_ID, number: "+91 40 6969 1200", friendlyName: "Main Reception", country: "India", countryCode: "IN", provider: "leadpulz", agentId: "agt_maya", agentName: "Maya — Dental Receptionist", incomingCalls: 2_814, outgoingCalls: 612, status: "active", capabilities: ["voice", "sms", "whatsapp"], monthlyCost: 799, createdAt: daysAgo(90) },
  { id: "pn_2", organizationId: ORG_ID, number: "+91 40 6969 1201", friendlyName: "Skyline Sales Line", country: "India", countryCode: "IN", provider: "twilio", agentId: "agt_arjun", agentName: "Arjun — Real Estate Lead Agent", incomingCalls: 640, outgoingCalls: 1_326, status: "active", capabilities: ["voice", "sms"], monthlyCost: 649, createdAt: daysAgo(60) },
  { id: "pn_3", organizationId: ORG_ID, number: "+91 40 6969 1202", friendlyName: "Patient Support", country: "India", countryCode: "IN", provider: "leadpulz", agentId: "agt_nisha", agentName: "Nisha — Customer Support Agent", incomingCalls: 1_180, outgoingCalls: 24, status: "active", capabilities: ["voice", "whatsapp"], monthlyCost: 799, createdAt: daysAgo(45) },
  { id: "pn_4", organizationId: ORG_ID, number: "+1 (415) 555-0142", friendlyName: "US Enquiries", country: "United States", countryCode: "US", provider: "byoc", agentId: null, agentName: null, incomingCalls: 0, outgoingCalls: 0, status: "pending", capabilities: ["voice"], monthlyCost: 0, createdAt: daysAgo(1) },
];

export const knowledgeBases: KnowledgeBase[] = [
  { id: "kb_apex", organizationId: ORG_ID, name: "Apex Dental Care", description: "Services, pricing, doctors, policies and post-treatment care.", documentCount: 8 },
  { id: "kb_skyline", organizationId: ORG_ID, name: "Skyline Realty", description: "Projects, pricing sheets, amenities and loan partners.", documentCount: 4 },
];

export const knowledgeDocuments: KnowledgeDocument[] = [
  { id: "kd_1", organizationId: ORG_ID, knowledgeBaseId: "kb_apex", title: "apexdentalcare.in (42 pages)", sourceType: "website", sourceRef: "https://apexdentalcare.in", agentIds: ["agt_maya", "agt_nisha", "agt_ravi"], chunks: 318, status: "ready", lastUpdatedAt: daysAgo(2), createdAt: daysAgo(90) },
  { id: "kd_2", organizationId: ORG_ID, knowledgeBaseId: "kb_apex", title: "Treatment Price List — Sep 2026.pdf", sourceType: "pdf", sourceRef: "price-list-sep-2026.pdf", agentIds: ["agt_maya", "agt_ravi"], chunks: 46, sizeKb: 812, status: "ready", lastUpdatedAt: daysAgo(6), createdAt: daysAgo(6) },
  { id: "kd_3", organizationId: ORG_ID, knowledgeBaseId: "kb_apex", title: "Post-treatment care guide.pdf", sourceType: "pdf", sourceRef: "post-treatment-care.pdf", agentIds: ["agt_nisha"], chunks: 62, sizeKb: 1_240, status: "ready", lastUpdatedAt: daysAgo(30), createdAt: daysAgo(30) },
  { id: "kd_4", organizationId: ORG_ID, knowledgeBaseId: "kb_apex", title: "Patient FAQs (54 questions)", sourceType: "faq", sourceRef: "faq", agentIds: ["agt_maya", "agt_nisha"], chunks: 54, status: "ready", lastUpdatedAt: daysAgo(4), createdAt: daysAgo(85) },
  { id: "kd_5", organizationId: ORG_ID, knowledgeBaseId: "kb_apex", title: "Insurance & EMI partners", sourceType: "manual", sourceRef: "manual", agentIds: ["agt_maya", "agt_nisha"], chunks: 9, status: "ready", lastUpdatedAt: daysAgo(12), createdAt: daysAgo(40) },
  { id: "kd_6", organizationId: ORG_ID, knowledgeBaseId: "kb_apex", title: "Doctor profiles & schedules.docx", sourceType: "docx", sourceRef: "doctors.docx", agentIds: ["agt_maya"], chunks: 18, sizeKb: 210, status: "ready", lastUpdatedAt: daysAgo(9), createdAt: daysAgo(70) },
  { id: "kd_7", organizationId: ORG_ID, knowledgeBaseId: "kb_apex", title: "Diwali offers 2026.pdf", sourceType: "pdf", sourceRef: "diwali-offers.pdf", agentIds: ["agt_maya"], chunks: 0, sizeKb: 3_420, status: "processing", lastUpdatedAt: minutesAgo(6), createdAt: minutesAgo(6) },
  { id: "kd_8", organizationId: ORG_ID, knowledgeBaseId: "kb_apex", title: "Clinic policies (Notion)", sourceType: "notion", sourceRef: "notion://Clinic Policies", agentIds: ["agt_nisha"], chunks: 0, status: "error", errorMessage: "Notion integration token expired. Reconnect Notion to resume sync.", lastUpdatedAt: daysAgo(1), createdAt: daysAgo(20) },
  { id: "kd_9", organizationId: ORG_ID, knowledgeBaseId: "kb_skyline", title: "skylinerealty.in (18 pages)", sourceType: "website", sourceRef: "https://skylinerealty.in", agentIds: ["agt_arjun"], chunks: 142, status: "ready", lastUpdatedAt: daysAgo(3), createdAt: daysAgo(58) },
  { id: "kd_10", organizationId: ORG_ID, knowledgeBaseId: "kb_skyline", title: "Skyline Meadows — Price Sheet Q3.xlsx", sourceType: "txt", sourceRef: "meadows-q3.txt", agentIds: ["agt_arjun"], chunks: 24, sizeKb: 96, status: "ready", lastUpdatedAt: daysAgo(8), createdAt: daysAgo(8) },
  { id: "kd_11", organizationId: ORG_ID, knowledgeBaseId: "kb_skyline", title: "Home loan partner rates", sourceType: "url", sourceRef: "https://skylinerealty.in/loans", agentIds: ["agt_arjun"], chunks: 7, status: "ready", lastUpdatedAt: daysAgo(15), createdAt: daysAgo(50) },
  { id: "kd_12", organizationId: ORG_ID, knowledgeBaseId: "kb_skyline", title: "Amenities brochure (Google Drive)", sourceType: "google_drive", sourceRef: "gdrive://Skyline/Amenities.pdf", agentIds: ["agt_arjun"], chunks: 31, sizeKb: 5_100, status: "ready", lastUpdatedAt: daysAgo(22), createdAt: daysAgo(22) },
];

export const integrations: Integration[] = [
  { id: "int_hubspot", key: "hubspot", name: "HubSpot", category: "crm", description: "Sync contacts, deals and call activities to HubSpot CRM.", status: "connected", connectedAt: daysAgo(80), lastSyncAt: minutesAgo(4) },
  { id: "int_salesforce", key: "salesforce", name: "Salesforce", category: "crm", description: "Push leads and log calls to Salesforce objects.", status: "available", premium: true },
  { id: "int_zoho", key: "zoho", name: "Zoho CRM", category: "crm", description: "Create leads and update deal stages in Zoho.", status: "available" },
  { id: "int_pipedrive", key: "pipedrive", name: "Pipedrive", category: "crm", description: "Add persons and deals to your Pipedrive pipeline.", status: "available" },
  { id: "int_ghl", key: "gohighlevel", name: "GoHighLevel", category: "crm", description: "Sync contacts and trigger GHL workflows.", status: "available", premium: true },
  { id: "int_gcal", key: "google_calendar", name: "Google Calendar", category: "calendar", description: "Let agents check availability and book directly on Google Calendar.", status: "connected", connectedAt: daysAgo(88), lastSyncAt: minutesAgo(1) },
  { id: "int_outlook", key: "outlook_calendar", name: "Outlook Calendar", category: "calendar", description: "Book and reschedule on Microsoft 365 calendars.", status: "available" },
  { id: "int_calcom", key: "calcom", name: "Cal.com", category: "calendar", description: "Use Cal.com event types for AI bookings.", status: "available" },
  { id: "int_calendly", key: "calendly", name: "Calendly", category: "calendar", description: "Book Calendly events from conversations.", status: "available" },
  { id: "int_twilio", key: "twilio", name: "Twilio", category: "communications", description: "Bring your own Twilio numbers and SMS.", status: "connected", connectedAt: daysAgo(60), lastSyncAt: minutesAgo(12) },
  { id: "int_whatsapp", key: "whatsapp", name: "WhatsApp Business", category: "communications", description: "Send templates and conversational messages via WhatsApp Cloud API.", status: "connected", connectedAt: daysAgo(75), lastSyncAt: minutesAgo(2) },
  { id: "int_gmail", key: "gmail", name: "Gmail", category: "communications", description: "Send follow-up emails from your Google Workspace.", status: "available" },
  { id: "int_slack", key: "slack", name: "Slack", category: "productivity", description: "Post qualified leads and alerts to Slack channels.", status: "connected", connectedAt: daysAgo(70), lastSyncAt: minutesAgo(4) },
  { id: "int_shopify", key: "shopify", name: "Shopify", category: "ecommerce", description: "Look up orders and sync product knowledge.", status: "available" },
  { id: "int_stripe", key: "stripe", name: "Stripe", category: "payments", description: "Collect deposits and send payment links during calls.", status: "available" },
  { id: "int_zapier", key: "zapier", name: "Zapier", category: "automation", description: "Connect LeadPulz events to 6,000+ apps.", status: "available" },
  { id: "int_make", key: "make", name: "Make", category: "automation", description: "Build scenarios triggered by LeadPulz events.", status: "available" },
  { id: "int_n8n", key: "n8n", name: "n8n", category: "automation", description: "Self-hosted automation with the LeadPulz node.", status: "error", connectedAt: daysAgo(15), lastSyncAt: daysAgo(1), errorMessage: "Webhook endpoint returned 502 for the last 3 deliveries." },
  { id: "int_webhooks", key: "webhooks", name: "Webhooks", category: "api", description: "Receive signed event payloads on your own endpoints.", status: "connected", connectedAt: daysAgo(85), lastSyncAt: minutesAgo(4) },
  { id: "int_rest", key: "rest_api", name: "REST API", category: "api", description: "Programmatic access to calls, leads, agents and more.", status: "connected", connectedAt: daysAgo(85), lastSyncAt: hoursAgo(1) },
];

export const notifications: Notification[] = [
  { id: "ntf_1", type: "new_qualified_lead", title: "New qualified lead", body: "Rahul Sharma — Dental Implant (score 92). Consultation booked tomorrow 11:30 AM.", href: "/leads/lead_rahul", read: false, createdAt: hoursAgo(1, 19) },
  { id: "ntf_2", type: "high_value_lead", title: "High-value lead", body: "Arjun Patel — 3BHK Skyline Meadows, est. ₹1.5 Cr. Site visit Saturday.", href: "/leads/lead_arjun", read: false, createdAt: daysAgo(1, 16, 45) },
  { id: "ntf_3", type: "appointment_booked", title: "Appointment booked", body: "Karthik Reddy — Aligner Fitting with Dr. Kavya Nair, Thursday 4:00 PM.", href: "/appointments", read: false, createdAt: hoursAgo(2, 30) },
  { id: "ntf_4", type: "integration_error", title: "Integration error", body: "n8n webhook returned 502 for the last 3 deliveries.", href: "/integrations", read: false, createdAt: hoursAgo(4) },
  { id: "ntf_5", type: "failed_call", title: "Failed call", body: "Outbound call to +91 98123 44510 failed — carrier error (SIP 503).", href: "/calls?filter=failed", read: true, createdAt: hoursAgo(6) },
  { id: "ntf_6", type: "campaign_completed", title: "Campaign completed", body: "Dormant Patients — 12 Month Reactivation finished: 142 appointments booked.", href: "/campaigns/cmp_reactivation", read: true, createdAt: daysAgo(4, 18, 0) },
  { id: "ntf_7", type: "agent_issue", title: "Agent paused", body: "Ravi — Lead Follow-up Agent was paused by Ananya Iyer.", href: "/agents/agt_ravi", read: true, createdAt: daysAgo(1, 18, 5) },
  { id: "ntf_8", type: "payment_issue", title: "Usage threshold", body: "You've used 68% of your AI voice minutes. Consider upgrading before the period ends.", href: "/billing", read: true, createdAt: daysAgo(2) },
];

export const plans: Plan[] = [
  { tier: "starter", name: "Starter", monthlyPrice: 4_999, currency: "INR", includedMinutes: 1_000, maxAgents: 2, maxNumbers: 1, perMinuteOverage: 6, features: ["1 AI agent template library", "Inbound calls", "Basic analytics", "Email support"] },
  { tier: "growth", name: "Growth", monthlyPrice: 14_999, currency: "INR", includedMinutes: 5_000, maxAgents: 10, maxNumbers: 5, perMinuteOverage: 5, features: ["Inbound + outbound campaigns", "Built-in CRM", "Workflows & follow-ups", "CRM & calendar integrations", "Priority support"], highlighted: true },
  { tier: "professional", name: "Professional", monthlyPrice: 39_999, currency: "INR", includedMinutes: 15_000, maxAgents: 30, maxNumbers: 15, perMinuteOverage: 4, features: ["Everything in Growth", "Multi-workspace", "Premium integrations", "API & webhooks", "Dedicated success manager"] },
  { tier: "enterprise", name: "Enterprise", monthlyPrice: null, currency: "INR", includedMinutes: 50_000, maxAgents: 999, maxNumbers: 999, perMinuteOverage: 3, features: ["Custom volume pricing", "White-label & sub-accounts", "SSO / SAML", "Custom SLAs", "On-prem voice options"] },
];

export const subscription: Subscription = {
  organizationId: ORG_ID,
  plan: "growth",
  status: "active",
  currentPeriodStart: daysAgo(17),
  currentPeriodEnd: daysFromNow(13),
  seats: 6,
  paymentMethod: { brand: "Visa", last4: "4242", expiry: "08/28" },
};

export const usage: Usage = {
  minutesUsed: 3_420,
  minutesIncluded: 5_000,
  calls: 1_284,
  agentsUsed: 4,
  agentsIncluded: 10,
  numbersUsed: 3,
  numbersIncluded: 5,
  estimatedCost: 17_246,
  premiumIntegrations: 0,
};

export const invoices: Invoice[] = [
  { id: "inv_5", number: "LP-2026-0912", date: daysAgo(17), amount: 14_999, status: "paid", pdfUrl: "#" },
  { id: "inv_4", number: "LP-2026-0811", date: daysAgo(47), amount: 16_870, status: "paid", pdfUrl: "#" },
  { id: "inv_3", number: "LP-2026-0710", date: daysAgo(78), amount: 14_999, status: "paid", pdfUrl: "#" },
  { id: "inv_2", number: "LP-2026-0609", date: daysAgo(108), amount: 4_999, status: "paid", pdfUrl: "#" },
];

export const apiKeys: ApiKey[] = [
  { id: "key_1", name: "Production — Website", prefix: "lp_live", maskedKey: "lp_live_a8f3••••••••9c2e", scopes: ["calls:write", "leads:read", "leads:write"], createdAt: daysAgo(80), lastUsedAt: minutesAgo(15), status: "active" },
  { id: "key_2", name: "Zapier", prefix: "lp_live", maskedKey: "lp_live_7b21••••••••d4a1", scopes: ["calls:read", "leads:read", "appointments:read"], createdAt: daysAgo(40), lastUsedAt: hoursAgo(3), status: "active" },
  { id: "key_3", name: "Staging", prefix: "lp_test", maskedKey: "lp_test_c0e9••••••••1f77", scopes: ["*"], createdAt: daysAgo(20), status: "revoked" },
];

export const webhookEndpoints: WebhookEndpoint[] = [
  { id: "wh_1", url: "https://hooks.apexdentalcare.in/leadpulz", events: ["call.completed", "lead.qualified", "appointment.booked"], status: "active", secretMasked: "whsec_••••••••4Qx9", createdAt: daysAgo(85) },
  { id: "wh_2", url: "https://n8n.apexdentalcare.in/webhook/leadpulz", events: ["call.completed", "campaign.completed"], status: "active", secretMasked: "whsec_••••••••Lm2p", createdAt: daysAgo(15) },
];

export const webhookLogs: WebhookLog[] = [
  { id: "wl_1", endpointId: "wh_1", event: "lead.qualified", statusCode: 200, durationMs: 182, at: hoursAgo(1, 19), success: true },
  { id: "wl_2", endpointId: "wh_1", event: "appointment.booked", statusCode: 200, durationMs: 210, at: hoursAgo(1, 18), success: true },
  { id: "wl_3", endpointId: "wh_2", event: "call.completed", statusCode: 502, durationMs: 5_004, at: hoursAgo(4), success: false },
  { id: "wl_4", endpointId: "wh_2", event: "call.completed", statusCode: 502, durationMs: 5_010, at: hoursAgo(4, 15), success: false },
  { id: "wl_5", endpointId: "wh_1", event: "call.completed", statusCode: 200, durationMs: 164, at: hoursAgo(5), success: true },
  { id: "wl_6", endpointId: "wh_2", event: "call.completed", statusCode: 502, durationMs: 5_002, at: hoursAgo(5, 30), success: false },
  { id: "wl_7", endpointId: "wh_1", event: "lead.qualified", statusCode: 200, durationMs: 190, at: hoursAgo(6), success: true },
];

export const auditLogs: AuditLog[] = [
  { id: "al_1", organizationId: ORG_ID, actor: "Sri Harsha", action: "agent.updated", target: "Maya — Dental Receptionist (v7)", ip: "49.205.12.8", at: daysAgo(2, 15, 20) },
  { id: "al_2", organizationId: ORG_ID, actor: "Ananya Iyer", action: "agent.paused", target: "Ravi — Lead Follow-up Agent", ip: "49.205.12.14", at: daysAgo(1, 18, 5) },
  { id: "al_3", organizationId: ORG_ID, actor: "Sri Harsha", action: "api_key.created", target: "Zapier", ip: "49.205.12.8", at: daysAgo(40, 12, 0) },
  { id: "al_4", organizationId: ORG_ID, actor: "Dr. Kavya Nair", action: "member.invited", target: "vikram@apexdental.in (Viewer)", ip: "49.205.12.31", at: daysAgo(3, 10, 12) },
  { id: "al_5", organizationId: ORG_ID, actor: "System", action: "integration.error", target: "n8n — webhook 502", at: hoursAgo(4) },
  { id: "al_6", organizationId: ORG_ID, actor: "Meera Krishnan", action: "knowledge.uploaded", target: "Diwali offers 2026.pdf", ip: "49.205.12.40", at: minutesAgo(6) },
  { id: "al_7", organizationId: ORG_ID, actor: "Sri Harsha", action: "billing.plan_changed", target: "Starter → Growth", ip: "49.205.12.8", at: daysAgo(78, 9, 30) },
];
