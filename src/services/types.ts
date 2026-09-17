/**
 * Service contracts.
 *
 * The UI only ever talks to these interfaces. `services/mock` implements them
 * with in-memory demo data; `services/api` implements them over the REST API.
 * Swap the implementation via `NEXT_PUBLIC_DATA_SOURCE=mock|api`.
 */
import type {
  Agent,
  AgentPerformance,
  AgentTemplate,
  ApiKey,
  Appointment,
  AppointmentStatus,
  AuditLog,
  Call,
  Campaign,
  ConversationFlow,
  ConversationIntelligence,
  DateRangeKey,
  FollowUpSequence,
  FunnelStage,
  Insight,
  Integration,
  Invoice,
  KnowledgeBase,
  KnowledgeDocument,
  KpiValue,
  Lead,
  LeadStage,
  LiveCall,
  Note,
  Notification,
  Organization,
  OrganizationMember,
  OrgRole,
  PhoneNumber,
  Plan,
  SearchResult,
  SeriesPoint,
  Subscription,
  TimelineEvent,
  Usage,
  User,
  WebhookEndpoint,
  WebhookLog,
  Workflow,
  WorkflowRun,
  Workspace,
} from "@/types";

export interface ListParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CallFilters extends ListParams {
  direction?: "inbound" | "outbound";
  outcome?: string;
  agentId?: string;
  status?: string;
}

export interface LeadFilters extends ListParams {
  stage?: LeadStage;
  quality?: string;
  agentId?: string;
}

export interface AuthService {
  getCurrentUser(): Promise<User | null>;
  signIn(input: { email: string; password: string }): Promise<{ user: User; onboarded: boolean }>;
  signUp(input: {
    fullName: string;
    businessName: string;
    email: string;
    password: string;
    country: string;
    phone: string;
  }): Promise<{ user: User }>;
  signInWithProvider(provider: "google" | "microsoft"): Promise<{ user: User; onboarded: boolean }>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
  verifyEmail(code: string): Promise<void>;
  resendVerification(email: string): Promise<void>;
  signOut(): Promise<void>;
}

export interface TenantService {
  getOrganizations(): Promise<Organization[]>;
  getOrganization(id: string): Promise<Organization | null>;
  getWorkspaces(organizationId: string): Promise<Workspace[]>;
  getMembers(organizationId: string): Promise<OrganizationMember[]>;
  inviteMember(organizationId: string, input: { email: string; role: OrgRole }): Promise<OrganizationMember>;
  updateMemberRole(memberId: string, role: OrgRole): Promise<OrganizationMember>;
  removeMember(memberId: string): Promise<void>;
  updateOrganization(id: string, patch: Partial<Organization>): Promise<Organization>;
}

export interface AgentService {
  list(): Promise<Agent[]>;
  get(id: string): Promise<Agent | null>;
  create(input: Partial<Agent> & { name: string }): Promise<Agent>;
  update(id: string, patch: Partial<Agent>): Promise<Agent>;
  duplicate(id: string): Promise<Agent>;
  setStatus(id: string, status: Agent["status"]): Promise<Agent>;
  remove(id: string): Promise<void>;
  getTemplates(): Promise<AgentTemplate[]>;
  getFlow(agentId: string): Promise<ConversationFlow>;
  saveFlow(agentId: string, flow: ConversationFlow): Promise<ConversationFlow>;
  previewVoice(voiceId: string, text: string): Promise<{ audioUrl: string; durationSec: number }>;
}

export interface PhoneNumberService {
  list(): Promise<PhoneNumber[]>;
  buy(input: { country: string; areaCode?: string; capabilities: PhoneNumber["capabilities"] }): Promise<PhoneNumber>;
  connectExisting(input: { number: string; provider: PhoneNumber["provider"] }): Promise<PhoneNumber>;
  assignAgent(numberId: string, agentId: string | null): Promise<PhoneNumber>;
  release(numberId: string): Promise<void>;
}

export interface CallService {
  list(filters?: CallFilters): Promise<Paginated<Call>>;
  get(id: string): Promise<Call | null>;
  getLive(): Promise<LiveCall[]>;
  getLiveCall(id: string): Promise<LiveCall | null>;
  startOutbound(input: { agentId: string; phone: string; objective?: string }): Promise<Call>;
  /** Subscribe to live transcript updates. Returns unsubscribe. */
  subscribeLive(callId: string, onUpdate: (call: LiveCall) => void): () => void;
}

export interface LeadService {
  list(filters?: LeadFilters): Promise<Paginated<Lead>>;
  get(id: string): Promise<Lead | null>;
  create(input: Partial<Lead> & { name: string; phone: string }): Promise<Lead>;
  update(id: string, patch: Partial<Lead>): Promise<Lead>;
  setStage(id: string, stage: LeadStage): Promise<Lead>;
  getTimeline(leadId: string): Promise<TimelineEvent[]>;
  getNotes(leadId: string): Promise<Note[]>;
  addNote(leadId: string, body: string): Promise<Note>;
  getCalls(leadId: string): Promise<Call[]>;
  getAppointments(leadId: string): Promise<Appointment[]>;
}

export interface AppointmentService {
  list(range?: { from: string; to: string }): Promise<Appointment[]>;
  create(input: Omit<Appointment, "id" | "organizationId">): Promise<Appointment>;
  setStatus(id: string, status: AppointmentStatus): Promise<Appointment>;
  reschedule(id: string, startsAt: string, endsAt: string): Promise<Appointment>;
}

export interface CampaignService {
  list(): Promise<Campaign[]>;
  get(id: string): Promise<Campaign | null>;
  create(input: Partial<Campaign> & { name: string }): Promise<Campaign>;
  setStatus(id: string, status: Campaign["status"]): Promise<Campaign>;
  importContacts(campaignId: string, file: File | null, rows?: number): Promise<{ imported: number; skipped: number }>;
}

export interface FollowUpService {
  list(): Promise<FollowUpSequence[]>;
  create(input: Partial<FollowUpSequence> & { name: string }): Promise<FollowUpSequence>;
  setStatus(id: string, status: FollowUpSequence["status"]): Promise<FollowUpSequence>;
}

export interface WorkflowService {
  list(): Promise<Workflow[]>;
  get(id: string): Promise<Workflow | null>;
  create(input: Partial<Workflow> & { name: string }): Promise<Workflow>;
  update(id: string, patch: Partial<Workflow>): Promise<Workflow>;
  setStatus(id: string, status: Workflow["status"]): Promise<Workflow>;
  getRuns(workflowId?: string): Promise<WorkflowRun[]>;
}

export interface KnowledgeService {
  listBases(): Promise<KnowledgeBase[]>;
  listDocuments(baseId?: string): Promise<KnowledgeDocument[]>;
  addSource(input: { baseId: string; title: string; sourceType: KnowledgeDocument["sourceType"]; sourceRef: string; agentIds?: string[] }): Promise<KnowledgeDocument>;
  assignAgents(docId: string, agentIds: string[]): Promise<KnowledgeDocument>;
  retry(docId: string): Promise<KnowledgeDocument>;
  remove(docId: string): Promise<void>;
}

export interface IntegrationService {
  list(): Promise<Integration[]>;
  connect(key: string): Promise<Integration>;
  disconnect(key: string): Promise<Integration>;
}

export interface AnalyticsService {
  getKpis(range: DateRangeKey): Promise<KpiValue[]>;
  getCallSeries(range: DateRangeKey): Promise<SeriesPoint[]>;
  getFunnel(range: DateRangeKey): Promise<FunnelStage[]>;
  getInsights(): Promise<Insight[]>;
  getAgentLeaderboard(range: DateRangeKey): Promise<AgentPerformance[]>;
  getConversationIntelligence(range: DateRangeKey): Promise<ConversationIntelligence>;
  getCostMetrics(range: DateRangeKey): Promise<{ costPerLead: number; costPerAppointment: number; aiResolutionRate: number; answeredRate: number }>;
}

export interface NotificationService {
  list(): Promise<Notification[]>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
  subscribe(onNotification: (n: Notification) => void): () => void;
}

export interface BillingService {
  getPlans(): Promise<Plan[]>;
  getSubscription(): Promise<Subscription>;
  getUsage(): Promise<Usage>;
  getInvoices(): Promise<Invoice[]>;
  changePlan(tier: Plan["tier"]): Promise<Subscription>;
}

export interface ApiSettingsService {
  listKeys(): Promise<ApiKey[]>;
  createKey(input: { name: string; scopes: string[] }): Promise<{ key: ApiKey; secret: string }>;
  revokeKey(id: string): Promise<void>;
  regenerateKey(id: string): Promise<{ key: ApiKey; secret: string }>;
  listWebhooks(): Promise<WebhookEndpoint[]>;
  createWebhook(input: { url: string; events: string[] }): Promise<WebhookEndpoint>;
  deleteWebhook(id: string): Promise<void>;
  getWebhookLogs(): Promise<WebhookLog[]>;
  getAuditLogs(): Promise<AuditLog[]>;
}

export interface SearchService {
  search(query: string): Promise<SearchResult[]>;
}

export interface Services {
  auth: AuthService;
  tenant: TenantService;
  agents: AgentService;
  phoneNumbers: PhoneNumberService;
  calls: CallService;
  leads: LeadService;
  appointments: AppointmentService;
  campaigns: CampaignService;
  followUps: FollowUpService;
  workflows: WorkflowService;
  knowledge: KnowledgeService;
  integrations: IntegrationService;
  analytics: AnalyticsService;
  notifications: NotificationService;
  billing: BillingService;
  apiSettings: ApiSettingsService;
  search: SearchService;
}

export class ServiceError extends Error {
  constructor(
    message: string,
    public code:
      | "network"
      | "api"
      | "provider"
      | "integration"
      | "knowledge"
      | "billing"
      | "not_found"
      | "unauthorized"
      | "validation" = "api",
    public status?: number,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
