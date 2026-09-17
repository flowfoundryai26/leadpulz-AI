import type { Contact, Lead, LeadStage, Note, TimelineEvent } from "@/types";
import { seeded } from "@/lib/utils";
import { ORG_ID, WORKSPACE_ID } from "./org";
import { addMinutes, daysAgo, daysFromNow, hoursAgo } from "./time";

export const contacts: Contact[] = [
  { id: "ct_rahul", organizationId: ORG_ID, name: "Rahul Sharma", phone: "+91 98491 22334", email: "rahul.sharma@gmail.com", tags: ["implants", "banjara-hills"], createdAt: hoursAgo(1, 21) },
  { id: "ct_priya", organizationId: ORG_ID, name: "Priya Reddy", phone: "+91 99630 77812", email: "priya.reddy@outlook.com", tags: ["whitening", "wedding"], createdAt: hoursAgo(3, 5) },
  { id: "ct_arjun", organizationId: ORG_ID, name: "Arjun Patel", phone: "+91 98200 45671", email: "arjun.patel@techcorp.in", company: "TechCorp India", tags: ["3bhk", "self-use", "99acres"], createdAt: daysAgo(3) },
  { id: "ct_sneha", organizationId: ORG_ID, name: "Sneha Kapoor", phone: "+91 98110 33420", email: "sneha.k@gmail.com", tags: ["existing-patient", "root-canal"], createdAt: daysAgo(14) },
];

const featuredLeads: Lead[] = [
  {
    id: "lead_rahul",
    organizationId: ORG_ID,
    workspaceId: WORKSPACE_ID,
    contactId: "ct_rahul",
    name: "Rahul Sharma",
    phone: "+91 98491 22334",
    email: "rahul.sharma@gmail.com",
    source: "inbound_call",
    score: 92,
    quality: "hot",
    agentId: "agt_maya",
    agentName: "Maya",
    stage: "appointment_booked",
    estimatedValue: 48_000,
    tags: ["implants", "banjara-hills", "emi"],
    lastConversationAt: hoursAgo(1, 21),
    lastConversationSummary: "Wants a single molar implant ASAP. Budget ₹40–50K. Consultation booked tomorrow 11:30 AM.",
    serviceInterest: "Dental Implant",
    location: "Jubilee Hills, Hyderabad",
    owner: "Dr. Kavya Nair",
    createdAt: hoursAgo(1, 21),
    updatedAt: hoursAgo(1, 18),
  },
  {
    id: "lead_priya",
    organizationId: ORG_ID,
    workspaceId: WORKSPACE_ID,
    contactId: "ct_priya",
    name: "Priya Reddy",
    phone: "+91 99630 77812",
    email: "priya.reddy@outlook.com",
    source: "inbound_call",
    score: 68,
    quality: "warm",
    agentId: "agt_maya",
    agentName: "Maya",
    stage: "contacted",
    estimatedValue: 9_900,
    tags: ["whitening", "wedding", "price-sensitive"],
    lastConversationAt: hoursAgo(3, 5),
    lastConversationSummary: "Whitening before sister's wedding in 3 weeks. Price objection at ₹12K; offered ₹9,900 package. Callback in 2 days.",
    serviceInterest: "Teeth Whitening",
    location: "Madhapur, Hyderabad",
    owner: "Rohan Mehta",
    createdAt: hoursAgo(3, 5),
    updatedAt: hoursAgo(3),
  },
  {
    id: "lead_arjun",
    organizationId: ORG_ID,
    workspaceId: WORKSPACE_ID,
    contactId: "ct_arjun",
    name: "Arjun Patel",
    company: "TechCorp India",
    phone: "+91 98200 45671",
    email: "arjun.patel@techcorp.in",
    source: "campaign",
    score: 85,
    quality: "hot",
    agentId: "agt_arjun",
    agentName: "Arjun",
    stage: "appointment_booked",
    estimatedValue: 1_50_00_000,
    tags: ["3bhk", "self-use", "home-loan"],
    lastConversationAt: daysAgo(1, 16, 42),
    lastConversationSummary: "Self-use 3BHK buyer, ₹1.5Cr budget, possession within 12 months. Site visit Saturday 11 AM.",
    serviceInterest: "3BHK — Skyline Meadows",
    location: "Gachibowli, Hyderabad",
    owner: "Divya Menon",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1, 16, 50),
  },
  {
    id: "lead_sneha",
    organizationId: ORG_ID,
    workspaceId: WORKSPACE_ID,
    contactId: "ct_sneha",
    name: "Sneha Kapoor",
    phone: "+91 98110 33420",
    email: "sneha.k@gmail.com",
    source: "inbound_call",
    score: 40,
    quality: "cold",
    agentId: "agt_nisha",
    agentName: "Nisha",
    stage: "won",
    estimatedValue: 18_500,
    tags: ["existing-patient", "root-canal"],
    lastConversationAt: daysAgo(0, 9, 12),
    lastConversationSummary: "Post root canal sensitivity — reassured, crown fitting confirmed next Tuesday 5 PM.",
    serviceInterest: "Root Canal + Crown",
    location: "Kondapur, Hyderabad",
    owner: "Dr. Kavya Nair",
    createdAt: daysAgo(14),
    updatedAt: daysAgo(0, 9, 15),
  },
];

const moreNames = [
  ["Vikram Rao", "Braces / Aligners", 65_000], ["Ananya Iyer", "Routine Check-up", 1_500], ["Karthik Reddy", "Dental Implant", 52_000],
  ["Divya Menon", "Teeth Whitening", 12_000], ["Suresh Kumar", "Wisdom Tooth Extraction", 8_000], ["Lakshmi Naidu", "Crown Replacement", 14_000],
  ["Aditya Verma", "3BHK — Skyline Meadows", 1_42_00_000], ["Pooja Agarwal", "Pediatric Dentistry", 3_500], ["Nikhil Joshi", "Dental Implant", 48_000],
  ["Shreya Das", "Braces / Aligners", 72_000], ["Manoj Pillai", "2BHK — Skyline Heights", 85_00_000], ["Kavitha Bhat", "Root Canal", 9_500],
  ["Rohit Malhotra", "Teeth Whitening", 9_900], ["Neha Kulkarni", "Dental Implant", 55_000], ["Farhan Ali", "Emergency Toothache", 4_500],
  ["Ritika Sen", "Braces / Aligners", 68_000], ["Sandeep Gupta", "3BHK — Skyline Meadows", 1_55_00_000], ["Meghana Chowdary", "2BHK Rental", 4_20_000],
  ["Harish Babu", "Insurance Query", 0], ["Ishita Roy", "Routine Check-up", 1_500], ["Abhishek Nair", "Dental Implant", 50_000],
  ["Tanvi Shah", "Teeth Whitening", 12_000], ["Yash Trivedi", "Wisdom Tooth Extraction", 8_500], ["Sunita Pawar", "Crown Replacement", 16_000],
] as const;

const stages: LeadStage[] = ["new", "new", "contacted", "contacted", "qualified", "qualified", "appointment_booked", "proposal_sent", "won", "lost"];
const rand = seeded(4242);

const generatedLeads: Lead[] = moreNames.map(([name, service, value], i) => {
  const stage = stages[Math.floor(rand() * stages.length)];
  const score = stage === "won" || stage === "appointment_booked" ? 78 + Math.floor(rand() * 20) : stage === "lost" ? Math.floor(rand() * 35) : 35 + Math.floor(rand() * 45);
  const isRe = service.includes("BHK");
  const dayOff = Math.floor(rand() * 28);
  return {
    id: `lead_${100 + i}`,
    organizationId: ORG_ID,
    workspaceId: WORKSPACE_ID,
    contactId: `ct_${100 + i}`,
    name,
    company: isRe && rand() > 0.5 ? ["Infosys", "Deloitte", "Amazon", "TCS"][Math.floor(rand() * 4)] : undefined,
    phone: `+91 9${String(7000000000 + Math.floor(rand() * 299999999)).slice(0, 9)}`,
    email: `${name.toLowerCase().replace(" ", ".")}@gmail.com`,
    source: (["inbound_call", "inbound_call", "campaign", "website", "whatsapp", "referral", "import"] as const)[Math.floor(rand() * 7)],
    score,
    quality: score >= 75 ? "hot" : score >= 50 ? "warm" : score >= 25 ? "cold" : "not_qualified",
    agentId: isRe ? "agt_arjun" : "agt_maya",
    agentName: isRe ? "Arjun" : "Maya",
    stage,
    estimatedValue: value,
    tags: [service.split(" ")[0].toLowerCase().replace("/", "")],
    lastConversationAt: daysAgo(dayOff, 9 + Math.floor(rand() * 9), Math.floor(rand() * 60)),
    lastConversationSummary: `Enquired about ${service.toLowerCase()}. ${stage === "lost" ? "Chose not to proceed." : "Awaiting next step."}`,
    serviceInterest: service,
    location: ["Banjara Hills", "Madhapur", "Kukatpally", "Gachibowli", "Kondapur", "Secunderabad"][Math.floor(rand() * 6)] + ", Hyderabad",
    owner: ["Rohan Mehta", "Dr. Kavya Nair", "Divya Menon", "Ananya Iyer"][Math.floor(rand() * 4)],
    createdAt: daysAgo(dayOff + 1),
    updatedAt: daysAgo(dayOff),
  };
});

export const leads: Lead[] = [...featuredLeads, ...generatedLeads];

export const timelineEvents: TimelineEvent[] = [
  { id: "tl_1", leadId: "lead_rahul", at: hoursAgo(1, 21), channel: "voice", type: "inbound_call", title: "Inbound call", description: "Called +91 40 6969 1200 — answered by Maya in 0.8s", actor: "Maya (AI)", refId: "call_rahul" },
  { id: "tl_2", leadId: "lead_rahul", at: addMinutes(hoursAgo(1, 21), 1.1), channel: "system", type: "qualified", title: "Qualified by Maya", description: "Lead score 92 — Hot lead. Budget ₹40–50K, immediate timeline.", actor: "Maya (AI)" },
  { id: "tl_3", leadId: "lead_rahul", at: addMinutes(hoursAgo(1, 21), 1.6), channel: "system", type: "appointment_booked", title: "Appointment booked", description: "Consultation with Dr. Kavya Nair — tomorrow 11:30 AM, Banjara Hills", actor: "Maya (AI)" },
  { id: "tl_4", leadId: "lead_rahul", at: addMinutes(hoursAgo(1, 21), 2.2), channel: "whatsapp", type: "whatsapp_sent", title: "WhatsApp sent", description: "Template: booking_confirmation — delivered, read", actor: "System" },
  { id: "tl_5", leadId: "lead_rahul", at: addMinutes(hoursAgo(1, 21), 2.3), channel: "system", type: "crm_updated", title: "HubSpot updated", description: "Contact created · Deal 'Rahul Sharma — Implant' ₹48,000 in stage Appointment Booked", actor: "Workflow: Sync qualified leads" },
  { id: "tl_6", leadId: "lead_rahul", at: daysFromNow(0, 19, 0), channel: "whatsapp", type: "reminder_sent", title: "Reminder scheduled", description: "Appointment reminder will be sent this evening at 7:00 PM", actor: "Workflow: Appointment reminders" },

  { id: "tl_7", leadId: "lead_priya", at: hoursAgo(3, 5), channel: "voice", type: "inbound_call", title: "Inbound call", description: "Teeth whitening pricing enquiry", actor: "Maya (AI)", refId: "call_priya" },
  { id: "tl_8", leadId: "lead_priya", at: addMinutes(hoursAgo(3, 5), 1.4), channel: "whatsapp", type: "whatsapp_sent", title: "WhatsApp sent", description: "Wedding-season whitening package details — delivered", actor: "Maya (AI)" },
  { id: "tl_9", leadId: "lead_priya", at: addMinutes(hoursAgo(3, 5), 1.5), channel: "system", type: "follow_up_scheduled", title: "Follow-up scheduled", description: "Ravi will call back in 2 days (Warm lead follow-up sequence)", actor: "Workflow: Warm lead follow-up" },

  { id: "tl_10", leadId: "lead_arjun", at: daysAgo(3, 14, 5), channel: "system", type: "stage_changed", title: "Lead created", description: "Imported from 99acres — Campaign: Portal Lead Follow-up", actor: "System" },
  { id: "tl_11", leadId: "lead_arjun", at: daysAgo(1, 16, 42), channel: "voice", type: "outbound_call", title: "Outbound call", description: "Qualified by Arjun — budget ₹1.5Cr, self-use, 12-month possession", actor: "Arjun (AI)", refId: "call_arjun_patel" },
  { id: "tl_12", leadId: "lead_arjun", at: daysAgo(1, 16, 44), channel: "system", type: "appointment_booked", title: "Site visit booked", description: "Saturday 11:00 AM — Skyline Experience Centre with Divya Menon", actor: "Arjun (AI)" },
  { id: "tl_13", leadId: "lead_arjun", at: daysAgo(1, 16, 45), channel: "whatsapp", type: "whatsapp_sent", title: "Brochure sent", description: "Tower B brochure + location pin", actor: "System" },
  { id: "tl_14", leadId: "lead_arjun", at: daysAgo(1, 17, 30), channel: "system", type: "note", title: "Note added", description: "Pre-approval form shared with HDFC partner. — Divya Menon", actor: "Divya Menon" },

  { id: "tl_15", leadId: "lead_sneha", at: daysAgo(14, 11, 0), channel: "voice", type: "inbound_call", title: "Inbound call", description: "Booked root canal consultation", actor: "Maya (AI)" },
  { id: "tl_16", leadId: "lead_sneha", at: daysAgo(7, 17, 0), channel: "system", type: "stage_changed", title: "Marked Won", description: "Root canal completed — ₹18,500", actor: "Dr. Kavya Nair" },
  { id: "tl_17", leadId: "lead_sneha", at: daysAgo(0, 9, 12), channel: "voice", type: "inbound_call", title: "Support call", description: "Post-treatment sensitivity — resolved by Nisha", actor: "Nisha (AI)", refId: "call_sneha" },
];

export const notes: Note[] = [
  { id: "note_1", leadId: "lead_rahul", author: "Dr. Kavya Nair", body: "Reserve the CBCT scanner for 11:30. If bone density is low, discuss the sinus lift option.", createdAt: hoursAgo(1, 2) },
  { id: "note_2", leadId: "lead_arjun", author: "Divya Menon", body: "Pre-approval form shared with HDFC partner. Bring Tower B floor plans for units 8B and 11B.", createdAt: daysAgo(1, 17, 30) },
  { id: "note_3", leadId: "lead_priya", author: "Rohan Mehta", body: "Price sensitive but high urgency (wedding). Push the ₹9,900 package with a 48-hour expiry.", createdAt: hoursAgo(2, 40) },
];
