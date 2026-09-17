import type {
  AgentType,
  CampaignType,
  Channel,
  Industry,
  IntegrationCategory,
  LanguageCode,
  LeadStage,
  OrgRole,
  Tone,
  WorkflowActionType,
  WorkflowTrigger,
} from "@/types";

export const APP_NAME = "LeadPulz AI";
export const COMPANY_NAME = "FlowFoundry AI Solutions";
export const TAGLINE = "Turn Every Conversation Into Revenue.";

/** Industries — extend this list to onboard new verticals. */
export const INDUSTRIES: Array<{ value: Industry; label: string }> = [
  { value: "dental", label: "Dental Clinic" },
  { value: "real_estate", label: "Real Estate" },
  { value: "hvac", label: "HVAC" },
  { value: "salon", label: "Salon & Spa" },
  { value: "restaurant", label: "Restaurant" },
  { value: "recruitment", label: "Recruitment Agency" },
  { value: "automotive", label: "Automotive Service" },
  { value: "healthcare", label: "Healthcare Clinic" },
  { value: "insurance", label: "Insurance Agency" },
  { value: "home_services", label: "Home Services" },
  { value: "agency", label: "Marketing Agency" },
  { value: "saas", label: "SaaS" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "local_business", label: "Local Business" },
  { value: "other", label: "Other" },
];

export const INDUSTRY_LABEL: Record<Industry, string> = Object.fromEntries(
  INDUSTRIES.map((i) => [i.value, i.label]),
) as Record<Industry, string>;

/** Languages — add entries here to extend language support. */
export const LANGUAGES: Array<{ code: LanguageCode; label: string; native: string }> = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "ja", label: "Japanese", native: "日本語" },
];

export const LANGUAGE_LABEL: Record<LanguageCode, string> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.label]),
) as Record<LanguageCode, string>;

export const TONES: Array<{ value: Tone; label: string; description: string }> = [
  { value: "professional", label: "Professional", description: "Polished, precise and businesslike." },
  { value: "friendly", label: "Friendly", description: "Warm and approachable." },
  { value: "energetic", label: "Energetic", description: "Upbeat with positive momentum." },
  { value: "calm", label: "Calm", description: "Measured, reassuring pace." },
  { value: "conversational", label: "Conversational", description: "Natural, human-like dialogue." },
  { value: "custom", label: "Custom", description: "Define your own tone guidelines." },
];

export const ACCENTS = ["Indian", "American", "British", "Australian", "Neutral"];

export const AGENT_TYPE_LABEL: Record<AgentType, string> = {
  inbound_receptionist: "Inbound Receptionist",
  lead_qualification: "Lead Qualification",
  customer_support: "Customer Support",
  outbound_follow_up: "Outbound Follow-up",
  sales: "Sales",
  appointment_reminder: "Appointment Reminder",
  reactivation: "Lead Reactivation",
  custom: "Custom",
};

export const AGENT_PURPOSES: Array<{ key: string; label: string; description: string }> = [
  { key: "answer_calls", label: "Answer incoming calls", description: "Pick up every call instantly, 24/7." },
  { key: "qualify_leads", label: "Qualify leads", description: "Ask the right questions and score intent." },
  { key: "book_appointments", label: "Book appointments", description: "Check availability and confirm bookings." },
  { key: "support", label: "Customer support", description: "Answer questions from your knowledge base." },
  { key: "outbound_follow_up", label: "Outbound lead follow-up", description: "Call back leads before they go cold." },
  { key: "sales_calls", label: "Sales calls", description: "Pitch, handle objections and convert." },
  { key: "reminders", label: "Appointment reminders", description: "Reduce no-shows with timely reminders." },
  { key: "reactivation", label: "Lead reactivation", description: "Re-engage dormant leads and past customers." },
  { key: "custom", label: "Custom", description: "Describe your own use case." },
];

export const CHANNEL_LABEL: Record<Channel, string> = {
  voice: "Voice",
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
  web_chat: "Website Chat",
  instagram: "Instagram",
  messenger: "Messenger",
};

export const LEAD_STAGES: Array<{ value: LeadStage; label: string; color: string }> = [
  { value: "new", label: "New Lead", color: "var(--lp-accent)" },
  { value: "contacted", label: "Contacted", color: "var(--lp-chart-5)" },
  { value: "qualified", label: "Qualified", color: "var(--lp-primary)" },
  { value: "appointment_booked", label: "Appointment Booked", color: "var(--lp-warning)" },
  { value: "proposal_sent", label: "Proposal Sent", color: "#f97316" },
  { value: "won", label: "Won", color: "var(--lp-success)" },
  { value: "lost", label: "Lost", color: "var(--lp-danger)" },
];

export const LEAD_STAGE_LABEL: Record<LeadStage, string> = Object.fromEntries(
  LEAD_STAGES.map((s) => [s.value, s.label]),
) as Record<LeadStage, string>;

export const CAMPAIGN_TYPES: Array<{ value: CampaignType; label: string; description: string }> = [
  { value: "lead_follow_up", label: "Lead follow-up", description: "Call back inbound leads within minutes." },
  { value: "cold_calling", label: "Cold calling", description: "Outreach to new prospect lists." },
  { value: "appointment_reminders", label: "Appointment reminders", description: "Confirm and reduce no-shows." },
  { value: "lead_reactivation", label: "Lead reactivation", description: "Win back dormant leads." },
  { value: "customer_feedback", label: "Customer feedback", description: "Collect NPS and reviews after service." },
  { value: "sales_outreach", label: "Sales outreach", description: "Pitch offers to targeted segments." },
  { value: "custom", label: "Custom", description: "Define your own objective." },
];

export const CAMPAIGN_TYPE_LABEL: Record<CampaignType, string> = Object.fromEntries(
  CAMPAIGN_TYPES.map((c) => [c.value, c.label]),
) as Record<CampaignType, string>;

export const ROLES: Array<{ value: OrgRole; label: string; description: string }> = [
  { value: "owner", label: "Owner", description: "Full access including billing and deletion." },
  { value: "admin", label: "Admin", description: "Manage everything except ownership transfer." },
  { value: "manager", label: "Manager", description: "Manage agents, campaigns and team members." },
  { value: "agent_manager", label: "Agent Manager", description: "Build and configure AI agents." },
  { value: "sales_rep", label: "Sales Rep", description: "Work leads, calls and appointments." },
  { value: "viewer", label: "Viewer", description: "Read-only access to dashboards." },
];

export const ROLE_LABEL: Record<OrgRole, string> = Object.fromEntries(
  ROLES.map((r) => [r.value, r.label]),
) as Record<OrgRole, string>;

export const WORKFLOW_TRIGGERS: Array<{ value: WorkflowTrigger; label: string }> = [
  { value: "call_completed", label: "Call completed" },
  { value: "lead_qualified", label: "Lead qualified" },
  { value: "appointment_booked", label: "Appointment booked" },
  { value: "appointment_cancelled", label: "Appointment cancelled" },
  { value: "lead_created", label: "Lead created" },
  { value: "lead_score_changed", label: "Lead score changed" },
  { value: "campaign_completed", label: "Campaign completed" },
];

export const WORKFLOW_TRIGGER_LABEL: Record<WorkflowTrigger, string> = Object.fromEntries(
  WORKFLOW_TRIGGERS.map((t) => [t.value, t.label]),
) as Record<WorkflowTrigger, string>;

export const WORKFLOW_ACTIONS: Array<{ value: WorkflowActionType; label: string }> = [
  { value: "send_email", label: "Send email" },
  { value: "send_sms", label: "Send SMS" },
  { value: "send_whatsapp", label: "Send WhatsApp" },
  { value: "make_ai_call", label: "Make AI call" },
  { value: "add_crm_lead", label: "Add CRM lead" },
  { value: "update_crm", label: "Update CRM" },
  { value: "book_appointment", label: "Book appointment" },
  { value: "create_task", label: "Create task" },
  { value: "webhook", label: "Webhook" },
  { value: "notify_team", label: "Notify team" },
  { value: "wait", label: "Wait" },
  { value: "condition", label: "Condition" },
];

export const INTEGRATION_CATEGORIES: Array<{ value: IntegrationCategory; label: string }> = [
  { value: "crm", label: "CRM" },
  { value: "calendar", label: "Calendar" },
  { value: "communications", label: "Communications" },
  { value: "automation", label: "Automation" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "payments", label: "Payments" },
  { value: "productivity", label: "Productivity" },
  { value: "api", label: "API" },
];

export const TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Australia/Sydney",
];

export const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Singapore",
  "Australia",
  "Canada",
  "Germany",
  "France",
  "Japan",
];

export const EMPLOYEE_RANGES = ["1–5", "6–20", "21–50", "51–200", "201–500", "500+"];

export const API_BASE_URL = "https://api.leadpulz.ai";
