/**
 * REST-backed service implementations.
 *
 * These map 1:1 onto the `/api/v1` route handlers. Realtime subscriptions use
 * Supabase Realtime / WebSockets in production — the stub here polls until the
 * realtime transport is wired in (see `lib/realtime`).
 */
import type { Services } from "../types";
import { api } from "./client";
import { mockServices } from "../mock";

const qs = (params: object) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const apiServices: Services = {
  auth: {
    getCurrentUser: () => api.get("/auth/me"),
    signIn: (input) => api.post("/auth/sign-in", input),
    signUp: (input) => api.post("/auth/sign-up", input),
    signInWithProvider: (provider) => api.post("/auth/oauth", { provider }),
    requestPasswordReset: (email) => api.post("/auth/forgot-password", { email }),
    resetPassword: (token, password) => api.post("/auth/reset-password", { token, password }),
    verifyEmail: (code) => api.post("/auth/verify-email", { code }),
    resendVerification: (email) => api.post("/auth/resend-verification", { email }),
    signOut: () => api.post("/auth/sign-out"),
  },
  tenant: {
    getOrganizations: () => api.get("/organizations"),
    getOrganization: (id) => api.get(`/organizations/${id}`),
    getWorkspaces: (orgId) => api.get(`/organizations/${orgId}/workspaces`),
    getMembers: (orgId) => api.get(`/organizations/${orgId}/members`),
    inviteMember: (orgId, input) => api.post(`/organizations/${orgId}/members`, input),
    updateMemberRole: (memberId, role) => api.patch(`/members/${memberId}`, { role }),
    removeMember: (memberId) => api.delete(`/members/${memberId}`),
    updateOrganization: (id, patch) => api.patch(`/organizations/${id}`, patch),
  },
  agents: {
    list: () => api.get("/agents"),
    get: (id) => api.get(`/agents/${id}`),
    create: (input) => api.post("/agents", input),
    update: (id, patch) => api.patch(`/agents/${id}`, patch),
    duplicate: (id) => api.post(`/agents/${id}/duplicate`),
    setStatus: (id, status) => api.patch(`/agents/${id}`, { status }),
    remove: (id) => api.delete(`/agents/${id}`),
    getTemplates: () => api.get("/agents/templates"),
    getFlow: (id) => api.get(`/agents/${id}/flow`),
    saveFlow: (id, flow) => api.post(`/agents/${id}/flow`, flow),
    previewVoice: (voiceId, text) => api.post("/voice/preview", { voiceId, text }),
  },
  phoneNumbers: {
    list: () => api.get("/phone-numbers"),
    buy: (input) => api.post("/phone-numbers/buy", input),
    connectExisting: (input) => api.post("/phone-numbers/connect", input),
    assignAgent: (id, agentId) => api.patch(`/phone-numbers/${id}`, { agentId }),
    release: (id) => api.delete(`/phone-numbers/${id}`),
  },
  calls: {
    list: (filters = {}) => api.get(`/calls${qs(filters)}`),
    get: (id) => api.get(`/calls/${id}`),
    getLive: () => api.get("/calls/live"),
    getLiveCall: (id) => api.get(`/calls/live/${id}`),
    startOutbound: (input) => api.post("/calls", input),
    subscribeLive: (callId, onUpdate) => {
      const timer = setInterval(async () => {
        try {
          const c = await api.get<Parameters<typeof onUpdate>[0]>(`/calls/live/${callId}`);
          onUpdate(c);
        } catch {
          /* transient */
        }
      }, 2000);
      return () => clearInterval(timer);
    },
  },
  leads: {
    list: (filters = {}) => api.get(`/leads${qs(filters)}`),
    get: (id) => api.get(`/leads/${id}`),
    create: (input) => api.post("/leads", input),
    update: (id, patch) => api.patch(`/leads/${id}`, patch),
    setStage: (id, stage) => api.patch(`/leads/${id}`, { stage }),
    getTimeline: (id) => api.get(`/leads/${id}/timeline`),
    getNotes: (id) => api.get(`/leads/${id}/notes`),
    addNote: (id, body) => api.post(`/leads/${id}/notes`, { body }),
    getCalls: (id) => api.get(`/leads/${id}/calls`),
    getAppointments: (id) => api.get(`/leads/${id}/appointments`),
  },
  appointments: {
    list: (range) => api.get(`/appointments${qs(range ?? {})}`),
    create: (input) => api.post("/appointments", input),
    setStatus: (id, status) => api.patch(`/appointments/${id}`, { status }),
    reschedule: (id, startsAt, endsAt) => api.patch(`/appointments/${id}`, { startsAt, endsAt }),
  },
  campaigns: {
    list: () => api.get("/campaigns"),
    get: (id) => api.get(`/campaigns/${id}`),
    create: (input) => api.post("/campaigns", input),
    setStatus: (id, status) => api.patch(`/campaigns/${id}`, { status }),
    importContacts: async (id, file) => {
      const fd = new FormData();
      if (file) fd.append("file", file);
      const res = await fetch(`/api/v1/campaigns/${id}/contacts/import`, { method: "POST", body: fd, credentials: "include" });
      return res.json();
    },
  },
  followUps: {
    list: () => api.get("/follow-ups"),
    create: (input) => api.post("/follow-ups", input),
    setStatus: (id, status) => api.patch(`/follow-ups/${id}`, { status }),
  },
  workflows: {
    list: () => api.get("/workflows"),
    get: (id) => api.get(`/workflows/${id}`),
    create: (input) => api.post("/workflows", input),
    update: (id, patch) => api.patch(`/workflows/${id}`, patch),
    setStatus: (id, status) => api.patch(`/workflows/${id}`, { status }),
    getRuns: (id) => api.get(`/workflows/runs${qs({ workflowId: id })}`),
  },
  knowledge: {
    listBases: () => api.get("/knowledge/bases"),
    listDocuments: (baseId) => api.get(`/knowledge/documents${qs({ baseId })}`),
    addSource: (input) => api.post("/knowledge/documents", input),
    assignAgents: (id, agentIds) => api.patch(`/knowledge/documents/${id}`, { agentIds }),
    retry: (id) => api.post(`/knowledge/documents/${id}/retry`),
    remove: (id) => api.delete(`/knowledge/documents/${id}`),
  },
  integrations: {
    list: () => api.get("/integrations"),
    connect: (key) => api.post(`/integrations/${key}/connect`),
    disconnect: (key) => api.post(`/integrations/${key}/disconnect`),
  },
  analytics: {
    getKpis: (range) => api.get(`/analytics/kpis${qs({ range })}`),
    getCallSeries: (range) => api.get(`/analytics/calls${qs({ range })}`),
    getFunnel: (range) => api.get(`/analytics/funnel${qs({ range })}`),
    getInsights: () => api.get("/analytics/insights"),
    getAgentLeaderboard: (range) => api.get(`/analytics/agents${qs({ range })}`),
    getConversationIntelligence: (range) => api.get(`/analytics/intelligence${qs({ range })}`),
    getCostMetrics: (range) => api.get(`/analytics/costs${qs({ range })}`),
  },
  notifications: {
    list: () => api.get("/notifications"),
    markRead: (id) => api.patch(`/notifications/${id}`, { read: true }),
    markAllRead: () => api.post("/notifications/read-all"),
    // Realtime transport (Supabase Realtime) is wired in lib/realtime; fall back to mock stream in the meantime.
    subscribe: mockServices.notifications.subscribe,
  },
  billing: {
    getPlans: () => api.get("/billing/plans"),
    getSubscription: () => api.get("/billing/subscription"),
    getUsage: () => api.get("/billing/usage"),
    getInvoices: () => api.get("/billing/invoices"),
    changePlan: (tier) => api.post("/billing/subscription", { tier }),
  },
  apiSettings: {
    listKeys: () => api.get("/api-keys"),
    createKey: (input) => api.post("/api-keys", input),
    revokeKey: (id) => api.delete(`/api-keys/${id}`),
    regenerateKey: (id) => api.post(`/api-keys/${id}/regenerate`),
    listWebhooks: () => api.get("/webhooks"),
    createWebhook: (input) => api.post("/webhooks", input),
    deleteWebhook: (id) => api.delete(`/webhooks/${id}`),
    getWebhookLogs: () => api.get("/webhooks/logs"),
    getAuditLogs: () => api.get("/audit-logs"),
  },
  search: {
    search: (q) => api.get(`/search${qs({ q })}`),
  },
};
