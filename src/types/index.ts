/**
 * LeadPulz AI — Domain types
 *
 * Multi-tenant hierarchy:
 *   Platform → Organization → Workspace → Members / Agents / Numbers / Calls / Leads / Campaigns
 *
 * Every tenant-scoped record carries `organizationId` (and usually `workspaceId`)
 * so services and RLS policies can enforce isolation.
 */

export type ID = string;
export type ISODate = string;

/* ───────────────────────── Tenancy ───────────────────────── */

export type OrgRole = "owner" | "admin" | "manager" | "agent_manager" | "sales_rep" | "viewer";

export interface User {
  id: ID;
  fullName: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  country?: string;
  emailVerified: boolean;
  platformAdmin?: boolean;
  createdAt: ISODate;
}

export interface Organization {
  id: ID;
  name: string;
  slug: string;
  industry: Industry;
  website?: string;
  country: string;
  timezone: string;
  plan: PlanTier;
  logoUrl?: string;
  /** White-label branding (agency feature). */
  branding?: Branding;
  /** Agency parent organization — enables sub-accounts. */
  parentOrganizationId?: ID | null;
  createdAt: ISODate;
}

export interface Branding {
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  customDomain?: string;
  productName?: string;
}

export interface Workspace {
  id: ID;
  organizationId: ID;
  name: string;
  slug: string;
  timezone: string;
  isDefault: boolean;
}

export interface OrganizationMember {
  id: ID;
  organizationId: ID;
  userId: ID;
  user: Pick<User, "fullName" | "email" | "avatarUrl">;
  role: OrgRole;
  status: "active" | "invited" | "suspended";
  permissions: MemberPermissions;
  lastActiveAt?: ISODate;
  joinedAt: ISODate;
}

export interface MemberPermissions {
  agents: "all" | "assigned" | "none";
  analytics: boolean;
  billing: boolean;
}

export type Industry =
  | "dental"
  | "real_estate"
  | "hvac"
  | "salon"
  | "restaurant"
  | "recruitment"
  | "automotive"
  | "healthcare"
  | "insurance"
  | "home_services"
  | "agency"
  | "saas"
  | "ecommerce"
  | "local_business"
  | "other";

/* ───────────────────────── Agents ───────────────────────── */

export type AgentStatus = "active" | "paused" | "draft";
export type AgentType =
  | "inbound_receptionist"
  | "lead_qualification"
  | "customer_support"
  | "outbound_follow_up"
  | "sales"
  | "appointment_reminder"
  | "reactivation"
  | "custom";

export type Channel = "voice" | "whatsapp" | "sms" | "email" | "web_chat" | "instagram" | "messenger";

export type LanguageCode =
  | "en" | "hi" | "te" | "ta" | "kn" | "ml" | "mr" | "gu" | "bn" | "es" | "fr" | "de" | "ja";

export type VoiceProviderId = "leadpulz" | "retell" | "vapi" | "elevenlabs" | "twilio";

export type Tone = "professional" | "friendly" | "energetic" | "calm" | "conversational" | "custom";

export interface VoiceConfig {
  provider: VoiceProviderId;
  voiceId: string;
  voiceName: string;
  gender: "female" | "male" | "neutral";
  accent: string;
  language: LanguageCode;
  additionalLanguages: LanguageCode[];
  speed: number; // 0.5 – 2.0
  responsiveness: number; // 0 – 1
  interruptionSensitivity: number; // 0 – 1
  backgroundNoiseHandling: "off" | "low" | "medium" | "high";
  pauseDurationMs: number;
  responseDelayMs: number;
  tone: Tone;
  emotion: "neutral" | "warm" | "cheerful" | "empathetic";
}

export interface CallBehavior {
  openingMessage: string;
  voicemailBehavior: "hang_up" | "leave_message" | "retry_later";
  voicemailMessage?: string;
  transferRules: TransferRule[];
  maxCallDurationSec: number;
  silenceTimeoutSec: number;
  fallbackResponse: string;
  humanHandoffNumber?: string;
  emergencyEscalationNumber?: string;
  businessHours: BusinessHours;
  holidays: Holiday[];
}

export interface TransferRule {
  id: ID;
  condition: string;
  destination: string;
  label: string;
}

export interface BusinessHours {
  timezone: string;
  days: Array<{ day: 0 | 1 | 2 | 3 | 4 | 5 | 6; open: string; close: string; enabled: boolean }>;
  afterHoursBehavior: "voicemail" | "ai_handles" | "transfer";
}

export interface Holiday {
  id: ID;
  date: ISODate;
  name: string;
}

export interface QualificationQuestion {
  id: ID;
  question: string;
  field: string;
  weight: number; // contribution to score
  required: boolean;
}

export interface QualificationConfig {
  questions: QualificationQuestion[];
  thresholds: { hot: number; warm: number; cold: number };
}

export interface Agent {
  id: ID;
  organizationId: ID;
  workspaceId: ID;
  name: string;
  role: string;
  company: string;
  description: string;
  goal: string;
  type: AgentType;
  status: AgentStatus;
  channels: Channel[];
  systemPrompt: string;
  voice: VoiceConfig;
  behavior: CallBehavior;
  qualification: QualificationConfig;
  knowledgeBaseIds: ID[];
  phoneNumberId?: ID | null;
  phoneNumber?: string | null;
  version: number;
  stats: {
    callsToday: number;
    callsTotal: number;
    conversionRate: number;
    avgDurationSec: number;
    qualifiedLeads: number;
    appointments: number;
    revenue: number;
  };
  lastActiveAt?: ISODate;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface AgentTemplate {
  id: ID;
  name: string;
  industry: Industry;
  type: AgentType;
  description: string;
  goal: string;
  systemPrompt: string;
  openingMessage: string;
  icon: string;
}

/* ───────────────────────── Flow builder ───────────────────────── */

export type FlowNodeType =
  | "start"
  | "speak"
  | "ask_question"
  | "identify_intent"
  | "condition"
  | "api_call"
  | "book_appointment"
  | "transfer_call"
  | "send_sms"
  | "send_whatsapp"
  | "send_email"
  | "crm_action"
  | "webhook"
  | "wait"
  | "end_call";

export interface FlowNode {
  id: ID;
  type: FlowNodeType;
  label: string;
  description?: string;
  position: { x: number; y: number };
  config?: Record<string, unknown>;
}

export interface FlowEdge {
  id: ID;
  source: ID;
  target: ID;
  label?: string;
}

export interface ConversationFlow {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

/* ───────────────────────── Phone numbers ───────────────────────── */

export interface PhoneNumber {
  id: ID;
  organizationId: ID;
  number: string;
  friendlyName: string;
  country: string;
  countryCode: string;
  provider: "leadpulz" | "twilio" | "byoc";
  agentId?: ID | null;
  agentName?: string | null;
  incomingCalls: number;
  outgoingCalls: number;
  status: "active" | "pending" | "inactive";
  capabilities: Array<"voice" | "sms" | "whatsapp" | "mms">;
  monthlyCost: number;
  createdAt: ISODate;
}

/* ───────────────────────── Calls ───────────────────────── */

export type CallDirection = "inbound" | "outbound";
export type CallStatus = "in_progress" | "completed" | "missed" | "failed" | "voicemail" | "transferred";
export type CallOutcome =
  | "qualified"
  | "booked"
  | "transferred"
  | "answered_question"
  | "not_interested"
  | "callback_requested"
  | "voicemail"
  | "missed"
  | "failed"
  | "in_progress";
export type Sentiment = "positive" | "neutral" | "negative";
export type LeadQuality = "hot" | "warm" | "cold" | "not_qualified";

export interface TranscriptTurn {
  id: ID;
  speaker: "ai" | "customer";
  text: string;
  offsetSec: number;
  highlights?: Array<{ text: string; kind: "intent" | "budget" | "timeline" | "contact" | "objection" | "location" }>;
}

export interface CallSummary {
  summary: string;
  intent: string;
  painPoints: string[];
  requirements: string[];
  budget?: string;
  timeline?: string;
  leadQuality: LeadQuality;
  nextAction: string;
  appointment?: string;
  sentiment: Sentiment;
}

export interface CallInsights {
  intent: string;
  buyingProbability: number; // 0–100
  sentiment: Sentiment;
  urgency: "low" | "medium" | "high";
  objections: string[];
  competitorMentions: string[];
  suggestedNextAction: string;
}

export interface CallEvent {
  id: ID;
  at: ISODate;
  type: string;
  description: string;
}

export interface Call {
  id: ID;
  organizationId: ID;
  workspaceId: ID;
  agentId: ID;
  agentName: string;
  contactId?: ID;
  leadId?: ID;
  customerName: string;
  customerPhone: string;
  phoneNumberId?: ID;
  phoneNumber: string;
  direction: CallDirection;
  status: CallStatus;
  outcome: CallOutcome;
  objective: string;
  durationSec: number;
  leadScore: number;
  sentiment: Sentiment;
  intent: string;
  appointmentStatus?: "booked" | "pending" | "none";
  recordingUrl?: string;
  startedAt: ISODate;
  endedAt?: ISODate;
  campaignId?: ID;
  transcript?: TranscriptTurn[];
  summary?: CallSummary;
  insights?: CallInsights;
  events?: CallEvent[];
  costMinutes: number;
}

export interface LiveCall {
  id: ID;
  agentId: ID;
  agentName: string;
  customerName: string;
  customerPhone: string;
  startedAt: ISODate;
  durationSec: number;
  stage: "GREETING" | "IDENTIFYING INTENT" | "QUALIFYING LEAD" | "ANSWERING FAQ" | "BOOKING APPOINTMENT" | "WRAPPING UP";
  intent: string;
  sentiment: Sentiment;
  transcript: TranscriptTurn[];
}

/* ───────────────────────── Contacts & Leads ───────────────────────── */

export type LeadStage =
  | "new"
  | "contacted"
  | "qualified"
  | "appointment_booked"
  | "proposal_sent"
  | "won"
  | "lost";

export type LeadSource = "inbound_call" | "outbound_call" | "website" | "whatsapp" | "campaign" | "referral" | "manual" | "import";

export interface Contact {
  id: ID;
  organizationId: ID;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  tags: string[];
  createdAt: ISODate;
}

export interface Lead {
  id: ID;
  organizationId: ID;
  workspaceId: ID;
  contactId: ID;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  source: LeadSource;
  score: number;
  quality: LeadQuality;
  agentId?: ID;
  agentName?: string;
  stage: LeadStage;
  estimatedValue: number;
  tags: string[];
  lastConversationAt?: ISODate;
  lastConversationSummary?: string;
  serviceInterest?: string;
  location?: string;
  owner?: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface TimelineEvent {
  id: ID;
  leadId: ID;
  at: ISODate;
  channel: Channel | "system";
  type:
    | "inbound_call"
    | "outbound_call"
    | "qualified"
    | "whatsapp_sent"
    | "sms_sent"
    | "email_sent"
    | "appointment_booked"
    | "reminder_sent"
    | "note"
    | "stage_changed"
    | "crm_updated"
    | "follow_up_scheduled";
  title: string;
  description?: string;
  actor: string; // "Maya (AI)", "System", user name
  refId?: ID;
}

export interface Note {
  id: ID;
  leadId: ID;
  author: string;
  body: string;
  createdAt: ISODate;
}

/* ───────────────────────── Appointments ───────────────────────── */

export type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled" | "no_show";

export interface Appointment {
  id: ID;
  organizationId: ID;
  leadId?: ID;
  customerName: string;
  customerPhone: string;
  service: string;
  staff: string;
  startsAt: ISODate;
  endsAt: ISODate;
  agentId?: ID;
  agentName?: string;
  status: AppointmentStatus;
  calendarProvider?: "google" | "outlook" | "calcom" | "calendly" | "internal";
  notes?: string;
  estimatedValue?: number;
}

/* ───────────────────────── Campaigns ───────────────────────── */

export type CampaignType =
  | "lead_follow_up"
  | "cold_calling"
  | "appointment_reminders"
  | "lead_reactivation"
  | "customer_feedback"
  | "sales_outreach"
  | "custom";

export type CampaignStatus = "draft" | "scheduled" | "running" | "paused" | "completed";

export interface Campaign {
  id: ID;
  organizationId: ID;
  name: string;
  type: CampaignType;
  agentId: ID;
  agentName: string;
  contactListName: string;
  totalContacts: number;
  callingHours: { start: string; end: string };
  timezone: string;
  maxAttempts: number;
  retryDelayMin: number;
  objective: string;
  script?: string;
  startDate: ISODate;
  endDate?: ISODate;
  status: CampaignStatus;
  stats: CampaignStats;
  createdAt: ISODate;
}

export interface CampaignStats {
  attempted: number;
  answered: number;
  interested: number;
  qualified: number;
  appointments: number;
  conversions: number;
  noAnswer: number;
  voicemail: number;
  doNotCall: number;
}

/* ───────────────────────── Follow-ups & Workflows ───────────────────────── */

export type FollowUpChannel = "phone" | "sms" | "whatsapp" | "email";

export interface FollowUpStep {
  id: ID;
  type: "send" | "wait" | "ai_call" | "crm_update" | "condition";
  channel?: FollowUpChannel;
  delayHours?: number;
  label: string;
  template?: string;
}

export interface FollowUpSequence {
  id: ID;
  organizationId: ID;
  name: string;
  trigger: string;
  steps: FollowUpStep[];
  status: "active" | "paused" | "draft";
  enrolled: number;
  completed: number;
  replyRate: number;
  createdAt: ISODate;
}

export type WorkflowTrigger =
  | "call_completed"
  | "lead_qualified"
  | "appointment_booked"
  | "appointment_cancelled"
  | "lead_created"
  | "lead_score_changed"
  | "campaign_completed";

export type WorkflowActionType =
  | "send_email"
  | "send_sms"
  | "send_whatsapp"
  | "make_ai_call"
  | "add_crm_lead"
  | "update_crm"
  | "book_appointment"
  | "create_task"
  | "webhook"
  | "notify_team"
  | "wait"
  | "condition";

export interface WorkflowStep {
  id: ID;
  type: WorkflowActionType;
  label: string;
  config?: Record<string, unknown>;
}

export interface Workflow {
  id: ID;
  organizationId: ID;
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  triggerFilter?: string;
  steps: WorkflowStep[];
  status: "active" | "paused" | "draft";
  runs: number;
  successRate: number;
  lastRunAt?: ISODate;
  createdAt: ISODate;
}

export interface WorkflowRun {
  id: ID;
  workflowId: ID;
  workflowName: string;
  startedAt: ISODate;
  status: "success" | "failed" | "running";
  triggerRef: string;
  durationMs: number;
  error?: string;
}

/* ───────────────────────── Knowledge ───────────────────────── */

export type KnowledgeSourceType =
  | "website"
  | "pdf"
  | "docx"
  | "txt"
  | "faq"
  | "manual"
  | "url"
  | "notion"
  | "google_drive"
  | "shopify"
  | "api";

export type KnowledgeStatus = "ready" | "processing" | "error";

export interface KnowledgeDocument {
  id: ID;
  organizationId: ID;
  knowledgeBaseId: ID;
  title: string;
  sourceType: KnowledgeSourceType;
  sourceRef: string;
  agentIds: ID[];
  chunks: number;
  sizeKb?: number;
  status: KnowledgeStatus;
  errorMessage?: string;
  lastUpdatedAt: ISODate;
  createdAt: ISODate;
}

export interface KnowledgeBase {
  id: ID;
  organizationId: ID;
  name: string;
  description?: string;
  documentCount: number;
}

/* ───────────────────────── Integrations ───────────────────────── */

export type IntegrationCategory =
  | "crm"
  | "calendar"
  | "communications"
  | "automation"
  | "ecommerce"
  | "payments"
  | "productivity"
  | "api";

export interface Integration {
  id: ID;
  key: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  status: "connected" | "available" | "error";
  connectedAt?: ISODate;
  lastSyncAt?: ISODate;
  premium?: boolean;
  errorMessage?: string;
}

/* ───────────────────────── Notifications ───────────────────────── */

export type NotificationType =
  | "new_qualified_lead"
  | "appointment_booked"
  | "high_value_lead"
  | "failed_call"
  | "campaign_completed"
  | "integration_error"
  | "payment_issue"
  | "agent_issue";

export interface Notification {
  id: ID;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt: ISODate;
}

/* ───────────────────────── Billing ───────────────────────── */

export type PlanTier = "starter" | "growth" | "professional" | "enterprise";

export interface Plan {
  tier: PlanTier;
  name: string;
  /** Placeholder configurable price — not a permanent public price. */
  monthlyPrice: number | null;
  currency: string;
  includedMinutes: number;
  maxAgents: number;
  maxNumbers: number;
  perMinuteOverage: number;
  features: string[];
  highlighted?: boolean;
}

export interface Subscription {
  organizationId: ID;
  plan: PlanTier;
  status: "active" | "trialing" | "past_due" | "cancelled";
  currentPeriodStart: ISODate;
  currentPeriodEnd: ISODate;
  seats: number;
  paymentMethod?: { brand: string; last4: string; expiry: string };
}

export interface Usage {
  minutesUsed: number;
  minutesIncluded: number;
  calls: number;
  agentsUsed: number;
  agentsIncluded: number;
  numbersUsed: number;
  numbersIncluded: number;
  estimatedCost: number;
  premiumIntegrations: number;
}

export interface Invoice {
  id: ID;
  number: string;
  date: ISODate;
  amount: number;
  status: "paid" | "open" | "failed";
  pdfUrl?: string;
}

/* ───────────────────────── API & Webhooks ───────────────────────── */

export interface ApiKey {
  id: ID;
  name: string;
  prefix: string;
  maskedKey: string;
  scopes: string[];
  createdAt: ISODate;
  lastUsedAt?: ISODate;
  status: "active" | "revoked";
}

export interface WebhookEndpoint {
  id: ID;
  url: string;
  events: string[];
  status: "active" | "disabled";
  secretMasked: string;
  createdAt: ISODate;
}

export interface WebhookLog {
  id: ID;
  endpointId: ID;
  event: string;
  statusCode: number;
  durationMs: number;
  at: ISODate;
  success: boolean;
}

/* ───────────────────────── Analytics ───────────────────────── */

export type DateRangeKey = "today" | "yesterday" | "7d" | "30d" | "custom";

export interface KpiValue {
  key: string;
  label: string;
  value: number;
  previous: number;
  format: "number" | "percent" | "currency" | "duration";
}

export interface SeriesPoint {
  date: ISODate;
  label: string;
  inbound: number;
  outbound: number;
  qualified: number;
  bookings: number;
}

export interface FunnelStage {
  key: string;
  label: string;
  value: number;
}

export interface Insight {
  id: ID;
  kind: "opportunity" | "warning" | "trend" | "recommendation";
  text: string;
  metric?: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface AgentPerformance {
  agentId: ID;
  agentName: string;
  calls: number;
  qualifiedLeads: number;
  appointments: number;
  conversionRate: number;
  revenue: number;
  avgDurationSec: number;
  resolutionRate: number;
}

export interface TopicStat {
  label: string;
  count: number;
  delta?: number;
}

export interface ConversationIntelligence {
  commonQuestions: TopicStat[];
  objections: TopicStat[];
  intents: TopicStat[];
  sentiment: { positive: number; neutral: number; negative: number };
  lostReasons: TopicStat[];
  bookingReasons: TopicStat[];
  serviceDemand: TopicStat[];
  topics: TopicStat[];
  keywordTrends: TopicStat[];
}

/* ───────────────────────── Audit & Admin ───────────────────────── */

export interface AuditLog {
  id: ID;
  organizationId?: ID;
  actor: string;
  action: string;
  target: string;
  ip?: string;
  at: ISODate;
}

export interface AdminOrgRow {
  id: ID;
  name: string;
  industry: Industry;
  plan: PlanTier;
  status: "active" | "trialing" | "churned" | "past_due";
  agents: number;
  monthlyCalls: number;
  minutes: number;
  mrr: number;
  createdAt: ISODate;
  country: string;
}

export interface SystemHealth {
  service: string;
  status: "operational" | "degraded" | "outage";
  latencyMs: number;
  uptime: number;
  errorRate: number;
}

/* ───────────────────────── Search ───────────────────────── */

export interface SearchResult {
  id: ID;
  type: "lead" | "call" | "agent" | "appointment" | "campaign" | "phone_number" | "page";
  title: string;
  subtitle?: string;
  href: string;
}
