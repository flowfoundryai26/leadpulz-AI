/**
 * Mock service implementations.
 *
 * In-memory, mutable copies of the demo dataset so that create/update/delete
 * actions feel real during a session. Latency is simulated so loading states
 * are exercised.
 */
import type {
  Agent,
  Appointment,
  Call,
  Campaign,
  ConversationFlow,
  FollowUpSequence,
  Integration,
  KnowledgeDocument,
  Lead,
  LiveCall,
  Notification,
  Organization,
  OrganizationMember,
  PhoneNumber,
  SearchResult,
  Workflow,
} from "@/types";
import { sleep, uid } from "@/lib/utils";
import { agents as seedAgents, agentTemplates, defaultFlow, defaultVoice, defaultQualification } from "@/data/mock/agents";
import { calls as seedCalls, liveCalls as seedLive } from "@/data/mock/calls";
import { contacts, leads as seedLeads, notes as seedNotes, timelineEvents } from "@/data/mock/leads";
import { appointments as seedAppointments } from "@/data/mock/appointments";
import { campaigns as seedCampaigns, followUpSequences as seedSequences, workflows as seedWorkflows, workflowRuns } from "@/data/mock/campaigns";
import { currentUser, members as seedMembers, organizations as seedOrgs, workspaces, ORG_ID, WORKSPACE_ID } from "@/data/mock/org";
import {
  apiKeys as seedKeys,
  auditLogs,
  integrations as seedIntegrations,
  invoices,
  knowledgeBases,
  knowledgeDocuments as seedDocs,
  notifications as seedNotifications,
  phoneNumbers as seedNumbers,
  plans,
  subscription as seedSubscription,
  usage,
  webhookEndpoints as seedWebhooks,
  webhookLogs,
} from "@/data/mock/platform";
import {
  agentLeaderboard,
  conversationIntelligence,
  costMetrics,
  funnel,
  getCallSeries,
  getKpis,
  insights,
} from "@/data/mock/analytics";
import { ServiceError, type Services } from "../types";
import { minutesAgo } from "@/data/mock/time";

const LATENCY = 220;
const latency = (ms = LATENCY) => sleep(ms);

/* In-memory state */
const state = {
  agents: structuredClone(seedAgents) as Agent[],
  flows: new Map<string, ConversationFlow>(),
  calls: structuredClone(seedCalls) as Call[],
  live: structuredClone(seedLive) as LiveCall[],
  leads: structuredClone(seedLeads) as Lead[],
  notes: structuredClone(seedNotes),
  appointments: structuredClone(seedAppointments) as Appointment[],
  campaigns: structuredClone(seedCampaigns) as Campaign[],
  sequences: structuredClone(seedSequences) as FollowUpSequence[],
  workflows: structuredClone(seedWorkflows) as Workflow[],
  docs: structuredClone(seedDocs) as KnowledgeDocument[],
  integrations: structuredClone(seedIntegrations) as Integration[],
  numbers: structuredClone(seedNumbers) as PhoneNumber[],
  notifications: structuredClone(seedNotifications) as Notification[],
  members: structuredClone(seedMembers) as OrganizationMember[],
  orgs: structuredClone(seedOrgs) as Organization[],
  keys: structuredClone(seedKeys),
  webhooks: structuredClone(seedWebhooks),
  subscription: structuredClone(seedSubscription),
  onboarded: true,
};

function paginate<T>(items: T[], page = 1, pageSize = 25) {
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
}

function matches(text: string | undefined, q: string) {
  return (text ?? "").toLowerCase().includes(q.toLowerCase());
}

export const mockServices: Services = {
  auth: {
    async getCurrentUser() {
      await latency(80);
      return currentUser;
    },
    async signIn({ email, password }) {
      await latency(700);
      if (!email.includes("@") || password.length < 6) {
        throw new ServiceError("Invalid email or password.", "unauthorized", 401);
      }
      return { user: currentUser, onboarded: state.onboarded };
    },
    async signUp(input) {
      await latency(900);
      state.onboarded = false;
      return { user: { ...currentUser, fullName: input.fullName, email: input.email, emailVerified: false } };
    },
    async signInWithProvider() {
      await latency(600);
      return { user: currentUser, onboarded: state.onboarded };
    },
    async requestPasswordReset() {
      await latency(600);
    },
    async resetPassword() {
      await latency(600);
    },
    async verifyEmail(code) {
      await latency(600);
      if (code.replace(/\D/g, "").length !== 6) throw new ServiceError("Invalid verification code.", "validation");
    },
    async resendVerification() {
      await latency(400);
    },
    async signOut() {
      await latency(200);
    },
  },

  tenant: {
    async getOrganizations() {
      await latency(120);
      return state.orgs;
    },
    async getOrganization(id) {
      await latency(120);
      return state.orgs.find((o) => o.id === id) ?? null;
    },
    async getWorkspaces(organizationId) {
      await latency(100);
      return workspaces.filter((w) => w.organizationId === organizationId);
    },
    async getMembers(organizationId) {
      await latency();
      return state.members.filter((m) => m.organizationId === organizationId);
    },
    async inviteMember(organizationId, input) {
      await latency(500);
      const m: OrganizationMember = {
        id: uid("mem"),
        organizationId,
        userId: uid("usr"),
        user: { fullName: input.email.split("@")[0], email: input.email },
        role: input.role,
        status: "invited",
        permissions: { agents: input.role === "viewer" ? "none" : "all", analytics: input.role !== "sales_rep", billing: input.role === "owner" || input.role === "admin" },
        joinedAt: new Date().toISOString(),
      };
      state.members.push(m);
      return m;
    },
    async updateMemberRole(memberId, role) {
      await latency(300);
      const m = state.members.find((x) => x.id === memberId);
      if (!m) throw new ServiceError("Member not found", "not_found", 404);
      m.role = role;
      return m;
    },
    async removeMember(memberId) {
      await latency(300);
      state.members = state.members.filter((m) => m.id !== memberId);
    },
    async updateOrganization(id, patch) {
      await latency(400);
      const o = state.orgs.find((x) => x.id === id);
      if (!o) throw new ServiceError("Organization not found", "not_found", 404);
      Object.assign(o, patch);
      return o;
    },
  },

  agents: {
    async list() {
      await latency();
      return state.agents;
    },
    async get(id) {
      await latency(160);
      return state.agents.find((a) => a.id === id) ?? null;
    },
    async create(input) {
      await latency(600);
      const now = new Date().toISOString();
      const agent: Agent = {
        id: uid("agt"),
        organizationId: ORG_ID,
        workspaceId: WORKSPACE_ID,
        name: input.name,
        role: input.role ?? "AI Agent",
        company: input.company ?? "Apex Dental Care",
        description: input.description ?? "",
        goal: input.goal ?? "",
        type: input.type ?? "custom",
        status: "draft",
        channels: input.channels ?? ["voice"],
        systemPrompt: input.systemPrompt ?? "",
        voice: input.voice ?? defaultVoice,
        behavior: input.behavior ?? seedAgents[0].behavior,
        qualification: input.qualification ?? defaultQualification,
        knowledgeBaseIds: input.knowledgeBaseIds ?? [],
        phoneNumberId: null,
        phoneNumber: null,
        version: 1,
        stats: { callsToday: 0, callsTotal: 0, conversionRate: 0, avgDurationSec: 0, qualifiedLeads: 0, appointments: 0, revenue: 0 },
        createdAt: now,
        updatedAt: now,
      };
      state.agents.unshift(agent);
      return agent;
    },
    async update(id, patch) {
      await latency(500);
      const a = state.agents.find((x) => x.id === id);
      if (!a) throw new ServiceError("Agent not found", "not_found", 404);
      Object.assign(a, patch, { updatedAt: new Date().toISOString(), version: a.version + 1 });
      return a;
    },
    async duplicate(id) {
      await latency(500);
      const a = state.agents.find((x) => x.id === id);
      if (!a) throw new ServiceError("Agent not found", "not_found", 404);
      const copy: Agent = {
        ...structuredClone(a),
        id: uid("agt"),
        name: `${a.name} (Copy)`,
        status: "draft",
        phoneNumberId: null,
        phoneNumber: null,
        version: 1,
        stats: { callsToday: 0, callsTotal: 0, conversionRate: 0, avgDurationSec: 0, qualifiedLeads: 0, appointments: 0, revenue: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.agents.unshift(copy);
      return copy;
    },
    async setStatus(id, status) {
      await latency(300);
      const a = state.agents.find((x) => x.id === id);
      if (!a) throw new ServiceError("Agent not found", "not_found", 404);
      a.status = status;
      return a;
    },
    async remove(id) {
      await latency(400);
      state.agents = state.agents.filter((a) => a.id !== id);
    },
    async getTemplates() {
      await latency(120);
      return agentTemplates;
    },
    async getFlow(agentId) {
      await latency(200);
      return state.flows.get(agentId) ?? structuredClone(defaultFlow);
    },
    async saveFlow(agentId, flow) {
      await latency(400);
      state.flows.set(agentId, flow);
      return flow;
    },
    async previewVoice() {
      await latency(900);
      return { audioUrl: "", durationSec: 4.2 };
    },
  },

  phoneNumbers: {
    async list() {
      await latency();
      return state.numbers;
    },
    async buy(input) {
      await latency(1200);
      const n: PhoneNumber = {
        id: uid("pn"),
        organizationId: ORG_ID,
        number: input.country === "India" ? `+91 40 6969 ${1203 + state.numbers.length}` : `+1 (415) 555-0${100 + state.numbers.length}`,
        friendlyName: "New number",
        country: input.country,
        countryCode: input.country === "India" ? "IN" : "US",
        provider: "leadpulz",
        agentId: null,
        agentName: null,
        incomingCalls: 0,
        outgoingCalls: 0,
        status: "active",
        capabilities: input.capabilities,
        monthlyCost: 799,
        createdAt: new Date().toISOString(),
      };
      state.numbers.push(n);
      return n;
    },
    async connectExisting(input) {
      await latency(900);
      const n: PhoneNumber = {
        id: uid("pn"),
        organizationId: ORG_ID,
        number: input.number,
        friendlyName: "Connected number",
        country: "India",
        countryCode: "IN",
        provider: input.provider,
        agentId: null,
        agentName: null,
        incomingCalls: 0,
        outgoingCalls: 0,
        status: "pending",
        capabilities: ["voice"],
        monthlyCost: 0,
        createdAt: new Date().toISOString(),
      };
      state.numbers.push(n);
      return n;
    },
    async assignAgent(numberId, agentId) {
      await latency(300);
      const n = state.numbers.find((x) => x.id === numberId);
      if (!n) throw new ServiceError("Number not found", "not_found", 404);
      const a = agentId ? state.agents.find((x) => x.id === agentId) : null;
      n.agentId = agentId;
      n.agentName = a?.name ?? null;
      return n;
    },
    async release(numberId) {
      await latency(400);
      state.numbers = state.numbers.filter((n) => n.id !== numberId);
    },
  },

  calls: {
    async list(filters = {}) {
      await latency();
      let items = state.calls;
      if (filters.direction) items = items.filter((c) => c.direction === filters.direction);
      if (filters.agentId) items = items.filter((c) => c.agentId === filters.agentId);
      if (filters.outcome) {
        const o = filters.outcome;
        items = items.filter((c) =>
          o === "completed" ? c.status === "completed" : o === "missed" ? c.status === "missed" : o === "failed" ? c.status === "failed" : c.outcome === o,
        );
      }
      if (filters.search) items = items.filter((c) => matches(c.customerName, filters.search!) || matches(c.customerPhone, filters.search!) || matches(c.intent, filters.search!));
      return paginate(items, filters.page, filters.pageSize);
    },
    async get(id) {
      await latency(260);
      return state.calls.find((c) => c.id === id) ?? null;
    },
    async getLive() {
      await latency(150);
      return state.live;
    },
    async getLiveCall(id) {
      await latency(150);
      return state.live.find((c) => c.id === id) ?? null;
    },
    async startOutbound(input) {
      await latency(900);
      const agent = state.agents.find((a) => a.id === input.agentId);
      if (!agent) throw new ServiceError("Agent not found", "not_found", 404);
      if (agent.status !== "active") throw new ServiceError("Agent must be active to place calls.", "provider");
      const now = new Date().toISOString();
      const call: Call = {
        id: uid("call"),
        organizationId: ORG_ID,
        workspaceId: WORKSPACE_ID,
        agentId: agent.id,
        agentName: agent.name,
        customerName: "Unknown",
        customerPhone: input.phone,
        phoneNumberId: agent.phoneNumberId ?? undefined,
        phoneNumber: agent.phoneNumber ?? "",
        direction: "outbound",
        status: "in_progress",
        outcome: "in_progress",
        objective: input.objective ?? "Outbound call",
        durationSec: 0,
        leadScore: 0,
        sentiment: "neutral",
        intent: "—",
        startedAt: now,
        costMinutes: 0,
      };
      state.calls.unshift(call);
      return call;
    },
    subscribeLive(callId, onUpdate) {
      // Simulate a realtime transcript stream: reveal one turn every few seconds.
      const source = seedLive.find((c) => c.id === callId) ?? seedLive[0];
      const full = seedCalls.find((c) => c.customerName === source.customerName)?.transcript ?? source.transcript;
      let idx = source.transcript.length;
      let tick = 0;
      const timer = setInterval(() => {
        tick += 1;
        const live = state.live.find((c) => c.id === callId);
        if (!live) return;
        live.durationSec += 2;
        if (tick % 3 === 0 && idx < full.length) {
          live.transcript = [...live.transcript, full[idx]];
          idx += 1;
          if (idx > 12) live.stage = "BOOKING APPOINTMENT";
          else if (idx > 6) live.stage = "QUALIFYING LEAD";
        }
        onUpdate({ ...live });
      }, 2000);
      return () => clearInterval(timer);
    },
  },

  leads: {
    async list(filters = {}) {
      await latency();
      let items = state.leads;
      if (filters.stage) items = items.filter((l) => l.stage === filters.stage);
      if (filters.quality) items = items.filter((l) => l.quality === filters.quality);
      if (filters.agentId) items = items.filter((l) => l.agentId === filters.agentId);
      if (filters.search) items = items.filter((l) => matches(l.name, filters.search!) || matches(l.phone, filters.search!) || matches(l.email, filters.search!) || matches(l.company, filters.search!));
      return paginate(items, filters.page, filters.pageSize ?? 100);
    },
    async get(id) {
      await latency(200);
      return state.leads.find((l) => l.id === id) ?? null;
    },
    async create(input) {
      await latency(500);
      const now = new Date().toISOString();
      const lead: Lead = {
        id: uid("lead"),
        organizationId: ORG_ID,
        workspaceId: WORKSPACE_ID,
        contactId: uid("ct"),
        name: input.name,
        phone: input.phone,
        email: input.email,
        company: input.company,
        source: input.source ?? "manual",
        score: input.score ?? 0,
        quality: "not_qualified",
        stage: "new",
        estimatedValue: input.estimatedValue ?? 0,
        tags: input.tags ?? [],
        serviceInterest: input.serviceInterest,
        createdAt: now,
        updatedAt: now,
      };
      state.leads.unshift(lead);
      return lead;
    },
    async update(id, patch) {
      await latency(400);
      const l = state.leads.find((x) => x.id === id);
      if (!l) throw new ServiceError("Lead not found", "not_found", 404);
      Object.assign(l, patch, { updatedAt: new Date().toISOString() });
      return l;
    },
    async setStage(id, stage) {
      await latency(250);
      const l = state.leads.find((x) => x.id === id);
      if (!l) throw new ServiceError("Lead not found", "not_found", 404);
      l.stage = stage;
      l.updatedAt = new Date().toISOString();
      return l;
    },
    async getTimeline(leadId) {
      await latency(200);
      return timelineEvents.filter((e) => e.leadId === leadId).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    },
    async getNotes(leadId) {
      await latency(150);
      return state.notes.filter((n) => n.leadId === leadId);
    },
    async addNote(leadId, body) {
      await latency(300);
      const n = { id: uid("note"), leadId, author: currentUser.fullName, body, createdAt: new Date().toISOString() };
      state.notes.unshift(n);
      return n;
    },
    async getCalls(leadId) {
      await latency(200);
      return state.calls.filter((c) => c.leadId === leadId);
    },
    async getAppointments(leadId) {
      await latency(200);
      return state.appointments.filter((a) => a.leadId === leadId);
    },
  },

  appointments: {
    async list() {
      await latency();
      return state.appointments;
    },
    async create(input) {
      await latency(500);
      const a: Appointment = { ...input, id: uid("apt"), organizationId: ORG_ID };
      state.appointments.push(a);
      return a;
    },
    async setStatus(id, status) {
      await latency(250);
      const a = state.appointments.find((x) => x.id === id);
      if (!a) throw new ServiceError("Appointment not found", "not_found", 404);
      a.status = status;
      return a;
    },
    async reschedule(id, startsAt, endsAt) {
      await latency(400);
      const a = state.appointments.find((x) => x.id === id);
      if (!a) throw new ServiceError("Appointment not found", "not_found", 404);
      a.startsAt = startsAt;
      a.endsAt = endsAt;
      return a;
    },
  },

  campaigns: {
    async list() {
      await latency();
      return state.campaigns;
    },
    async get(id) {
      await latency(200);
      return state.campaigns.find((c) => c.id === id) ?? null;
    },
    async create(input) {
      await latency(700);
      const agent = state.agents.find((a) => a.id === input.agentId) ?? state.agents[0];
      const c: Campaign = {
        id: uid("cmp"),
        organizationId: ORG_ID,
        name: input.name,
        type: input.type ?? "custom",
        agentId: agent.id,
        agentName: agent.name,
        contactListName: input.contactListName ?? "Imported contacts",
        totalContacts: input.totalContacts ?? 0,
        callingHours: input.callingHours ?? { start: "10:00", end: "18:00" },
        timezone: input.timezone ?? "Asia/Kolkata",
        maxAttempts: input.maxAttempts ?? 2,
        retryDelayMin: input.retryDelayMin ?? 240,
        objective: input.objective ?? "",
        script: input.script,
        startDate: input.startDate ?? new Date().toISOString(),
        endDate: input.endDate,
        status: "draft",
        stats: { attempted: 0, answered: 0, interested: 0, qualified: 0, appointments: 0, conversions: 0, noAnswer: 0, voicemail: 0, doNotCall: 0 },
        createdAt: new Date().toISOString(),
      };
      state.campaigns.unshift(c);
      return c;
    },
    async setStatus(id, status) {
      await latency(300);
      const c = state.campaigns.find((x) => x.id === id);
      if (!c) throw new ServiceError("Campaign not found", "not_found", 404);
      c.status = status;
      return c;
    },
    async importContacts(_campaignId, _file, rows = 0) {
      await latency(1400);
      const imported = rows || 120 + Math.floor(Math.random() * 80);
      return { imported, skipped: Math.floor(imported * 0.04) };
    },
  },

  followUps: {
    async list() {
      await latency();
      return state.sequences;
    },
    async create(input) {
      await latency(600);
      const s: FollowUpSequence = {
        id: uid("seq"),
        organizationId: ORG_ID,
        name: input.name,
        trigger: input.trigger ?? "Call completed",
        steps: input.steps ?? [],
        status: "draft",
        enrolled: 0,
        completed: 0,
        replyRate: 0,
        createdAt: new Date().toISOString(),
      };
      state.sequences.unshift(s);
      return s;
    },
    async setStatus(id, status) {
      await latency(250);
      const s = state.sequences.find((x) => x.id === id);
      if (!s) throw new ServiceError("Sequence not found", "not_found", 404);
      s.status = status;
      return s;
    },
  },

  workflows: {
    async list() {
      await latency();
      return state.workflows;
    },
    async get(id) {
      await latency(200);
      return state.workflows.find((w) => w.id === id) ?? null;
    },
    async create(input) {
      await latency(600);
      const w: Workflow = {
        id: uid("wf"),
        organizationId: ORG_ID,
        name: input.name,
        description: input.description,
        trigger: input.trigger ?? "call_completed",
        triggerFilter: input.triggerFilter,
        steps: input.steps ?? [],
        status: "draft",
        runs: 0,
        successRate: 0,
        createdAt: new Date().toISOString(),
      };
      state.workflows.unshift(w);
      return w;
    },
    async update(id, patch) {
      await latency(400);
      const w = state.workflows.find((x) => x.id === id);
      if (!w) throw new ServiceError("Workflow not found", "not_found", 404);
      Object.assign(w, patch);
      return w;
    },
    async setStatus(id, status) {
      await latency(250);
      const w = state.workflows.find((x) => x.id === id);
      if (!w) throw new ServiceError("Workflow not found", "not_found", 404);
      w.status = status;
      return w;
    },
    async getRuns(workflowId) {
      await latency(200);
      return workflowId ? workflowRuns.filter((r) => r.workflowId === workflowId) : workflowRuns;
    },
  },

  knowledge: {
    async listBases() {
      await latency(150);
      return knowledgeBases;
    },
    async listDocuments(baseId) {
      await latency();
      return baseId ? state.docs.filter((d) => d.knowledgeBaseId === baseId) : state.docs;
    },
    async addSource(input) {
      await latency(800);
      const doc: KnowledgeDocument = {
        id: uid("kd"),
        organizationId: ORG_ID,
        knowledgeBaseId: input.baseId,
        title: input.title,
        sourceType: input.sourceType,
        sourceRef: input.sourceRef,
        agentIds: input.agentIds ?? [],
        chunks: 0,
        status: "processing",
        lastUpdatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      state.docs.unshift(doc);
      // Simulate processing → ready
      setTimeout(() => {
        doc.status = "ready";
        doc.chunks = 12 + Math.floor(Math.random() * 60);
        doc.lastUpdatedAt = new Date().toISOString();
      }, 4000);
      return doc;
    },
    async assignAgents(docId, agentIds) {
      await latency(300);
      const d = state.docs.find((x) => x.id === docId);
      if (!d) throw new ServiceError("Document not found", "not_found", 404);
      d.agentIds = agentIds;
      return d;
    },
    async retry(docId) {
      await latency(500);
      const d = state.docs.find((x) => x.id === docId);
      if (!d) throw new ServiceError("Document not found", "not_found", 404);
      d.status = "processing";
      d.errorMessage = undefined;
      setTimeout(() => {
        d.status = "ready";
        d.chunks = 20;
      }, 4000);
      return d;
    },
    async remove(docId) {
      await latency(300);
      state.docs = state.docs.filter((d) => d.id !== docId);
    },
  },

  integrations: {
    async list() {
      await latency();
      return state.integrations;
    },
    async connect(key) {
      await latency(1100);
      const i = state.integrations.find((x) => x.key === key);
      if (!i) throw new ServiceError("Integration not found", "not_found", 404);
      i.status = "connected";
      i.connectedAt = new Date().toISOString();
      i.lastSyncAt = new Date().toISOString();
      i.errorMessage = undefined;
      return i;
    },
    async disconnect(key) {
      await latency(500);
      const i = state.integrations.find((x) => x.key === key);
      if (!i) throw new ServiceError("Integration not found", "not_found", 404);
      i.status = "available";
      i.connectedAt = undefined;
      i.lastSyncAt = undefined;
      return i;
    },
  },

  analytics: {
    async getKpis(range) {
      await latency(260);
      return getKpis(range);
    },
    async getCallSeries(range) {
      await latency(300);
      return getCallSeries(range);
    },
    async getFunnel(range) {
      await latency(200);
      const scale = range === "today" ? 0.072 : range === "yesterday" ? 0.063 : range === "7d" ? 0.25 : 1;
      return funnel.map((f) => ({ ...f, value: Math.round(f.value * scale) }));
    },
    async getInsights() {
      await latency(240);
      return insights;
    },
    async getAgentLeaderboard(range) {
      await latency(240);
      const scale = range === "today" ? 0.072 : range === "yesterday" ? 0.063 : range === "7d" ? 0.25 : 1;
      return agentLeaderboard.map((a) => ({
        ...a,
        calls: Math.round(a.calls * scale),
        qualifiedLeads: Math.round(a.qualifiedLeads * scale),
        appointments: Math.round(a.appointments * scale),
        revenue: Math.round(a.revenue * scale),
      }));
    },
    async getConversationIntelligence() {
      await latency(280);
      return conversationIntelligence;
    },
    async getCostMetrics() {
      await latency(150);
      return costMetrics;
    },
  },

  notifications: {
    async list() {
      await latency(120);
      return state.notifications;
    },
    async markRead(id) {
      const n = state.notifications.find((x) => x.id === id);
      if (n) n.read = true;
    },
    async markAllRead() {
      state.notifications.forEach((n) => (n.read = true));
    },
    subscribe(onNotification) {
      const timer = setTimeout(() => {
        const n: Notification = {
          id: uid("ntf"),
          type: "new_qualified_lead",
          title: "New qualified lead",
          body: "Meghana Chowdary — 2BHK Rental (score 71). Arjun is booking a site visit.",
          href: "/leads",
          read: false,
          createdAt: minutesAgo(0),
        };
        state.notifications.unshift(n);
        onNotification(n);
      }, 25_000);
      return () => clearTimeout(timer);
    },
  },

  billing: {
    async getPlans() {
      await latency(120);
      return plans;
    },
    async getSubscription() {
      await latency(150);
      return state.subscription;
    },
    async getUsage() {
      await latency(150);
      return usage;
    },
    async getInvoices() {
      await latency(180);
      return invoices;
    },
    async changePlan(tier) {
      await latency(900);
      state.subscription.plan = tier;
      return state.subscription;
    },
  },

  apiSettings: {
    async listKeys() {
      await latency(150);
      return state.keys;
    },
    async createKey(input) {
      await latency(600);
      const raw = `lp_live_${uid("").slice(1)}${uid("").slice(1)}${uid("").slice(1)}`;
      const key = {
        id: uid("key"),
        name: input.name,
        prefix: "lp_live",
        maskedKey: `${raw.slice(0, 12)}••••••••${raw.slice(-4)}`,
        scopes: input.scopes,
        createdAt: new Date().toISOString(),
        status: "active" as const,
      };
      state.keys.unshift(key);
      return { key, secret: raw };
    },
    async revokeKey(id) {
      await latency(300);
      const k = state.keys.find((x) => x.id === id);
      if (k) k.status = "revoked";
    },
    async regenerateKey(id) {
      await latency(600);
      const k = state.keys.find((x) => x.id === id);
      if (!k) throw new ServiceError("Key not found", "not_found", 404);
      const raw = `lp_live_${uid("").slice(1)}${uid("").slice(1)}${uid("").slice(1)}`;
      k.maskedKey = `${raw.slice(0, 12)}••••••••${raw.slice(-4)}`;
      k.createdAt = new Date().toISOString();
      return { key: k, secret: raw };
    },
    async listWebhooks() {
      await latency(150);
      return state.webhooks;
    },
    async createWebhook(input) {
      await latency(500);
      const w = { id: uid("wh"), url: input.url, events: input.events, status: "active" as const, secretMasked: "whsec_••••••••" + uid("").slice(-4), createdAt: new Date().toISOString() };
      state.webhooks.push(w);
      return w;
    },
    async deleteWebhook(id) {
      await latency(300);
      state.webhooks = state.webhooks.filter((w) => w.id !== id);
    },
    async getWebhookLogs() {
      await latency(200);
      return webhookLogs;
    },
    async getAuditLogs() {
      await latency(200);
      return auditLogs;
    },
  },

  search: {
    async search(query) {
      await latency(120);
      const q = query.trim();
      if (!q) return [];
      const results: SearchResult[] = [];
      state.leads.filter((l) => matches(l.name, q) || matches(l.phone, q) || matches(l.company, q)).slice(0, 5).forEach((l) =>
        results.push({ id: l.id, type: "lead", title: l.name, subtitle: `${l.serviceInterest ?? "Lead"} · ${l.phone}`, href: `/leads/${l.id}` }),
      );
      state.calls.filter((c) => matches(c.customerName, q) || matches(c.intent, q)).slice(0, 5).forEach((c) =>
        results.push({ id: c.id, type: "call", title: `${c.customerName} — ${c.intent}`, subtitle: `${c.agentName} · ${c.direction}`, href: `/calls/${c.id}` }),
      );
      state.agents.filter((a) => matches(a.name, q) || matches(a.role, q)).slice(0, 4).forEach((a) =>
        results.push({ id: a.id, type: "agent", title: a.name, subtitle: a.role, href: `/agents/${a.id}` }),
      );
      state.appointments.filter((a) => matches(a.customerName, q) || matches(a.service, q)).slice(0, 4).forEach((a) =>
        results.push({ id: a.id, type: "appointment", title: `${a.customerName} — ${a.service}`, subtitle: a.staff, href: `/appointments?focus=${a.id}` }),
      );
      state.campaigns.filter((c) => matches(c.name, q)).slice(0, 3).forEach((c) =>
        results.push({ id: c.id, type: "campaign", title: c.name, subtitle: c.agentName, href: `/campaigns/${c.id}` }),
      );
      state.numbers.filter((n) => matches(n.number, q) || matches(n.friendlyName, q)).slice(0, 3).forEach((n) =>
        results.push({ id: n.id, type: "phone_number", title: n.number, subtitle: n.friendlyName, href: `/phone-numbers` }),
      );
      return results;
    },
  },
};

export { contacts };
