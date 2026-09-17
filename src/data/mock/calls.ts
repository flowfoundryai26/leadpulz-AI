import type { Call, CallOutcome, CallStatus, LiveCall, Sentiment, TranscriptTurn } from "@/types";
import { seeded } from "@/lib/utils";
import { ORG_ID, WORKSPACE_ID } from "./org";
import { addMinutes, daysAgo, hoursAgo, minutesAgo } from "./time";

const rahulTranscript: TranscriptTurn[] = [
  { id: "t1", speaker: "ai", offsetSec: 0, text: "Hello, thank you for calling Apex Dental Care. I'm Maya, the virtual assistant. How can I help you today?" },
  { id: "t2", speaker: "customer", offsetSec: 6, text: "Hi, I'm interested in getting dental implants. I lost a molar a few months back.", highlights: [{ text: "dental implants", kind: "intent" }] },
  { id: "t3", speaker: "ai", offsetSec: 13, text: "I'd be happy to help with that. Are you looking for a single implant or multiple implants?" },
  { id: "t4", speaker: "customer", offsetSec: 18, text: "Just one for now. Maybe a second one later, but let's start with one." },
  { id: "t5", speaker: "ai", offsetSec: 24, text: "Understood. May I have your name and the best number to reach you on?" },
  { id: "t6", speaker: "customer", offsetSec: 29, text: "Rahul Sharma. This number is fine — 98491 22334.", highlights: [{ text: "98491 22334", kind: "contact" }] },
  { id: "t7", speaker: "ai", offsetSec: 36, text: "Thanks, Rahul. A single implant at Apex Dental starts from ₹35,000 and goes up to ₹55,000 depending on the crown material. Do you have a budget in mind?" },
  { id: "t8", speaker: "customer", offsetSec: 47, text: "Around 40 to 50 thousand is fine if the quality is good.", highlights: [{ text: "40 to 50 thousand", kind: "budget" }] },
  { id: "t9", speaker: "ai", offsetSec: 54, text: "That's well within range. And when were you hoping to get started — this month, or are you still exploring options?" },
  { id: "t10", speaker: "customer", offsetSec: 61, text: "As soon as possible really, it's getting difficult to chew on that side.", highlights: [{ text: "As soon as possible", kind: "timeline" }] },
  { id: "t11", speaker: "ai", offsetSec: 68, text: "I understand, let's get that sorted. Which area are you in? We have clinics in Banjara Hills and Kukatpally." },
  { id: "t12", speaker: "customer", offsetSec: 75, text: "Banjara Hills works — I'm in Jubilee Hills.", highlights: [{ text: "Jubilee Hills", kind: "location" }] },
  { id: "t13", speaker: "ai", offsetSec: 81, text: "Perfect. Dr. Kavya Nair, our implantologist, has a free consultation available tomorrow at 11:30 AM or Thursday at 4:00 PM. Which works better?" },
  { id: "t14", speaker: "customer", offsetSec: 92, text: "Tomorrow 11:30 works." },
  { id: "t15", speaker: "ai", offsetSec: 96, text: "Booked. You'll receive a WhatsApp confirmation with the clinic location shortly. The consultation includes a 3D scan, so please plan for about 45 minutes. Is there anything else I can help with?" },
  { id: "t16", speaker: "customer", offsetSec: 108, text: "Does insurance cover implants?" },
  { id: "t17", speaker: "ai", offsetSec: 112, text: "Most Indian health insurance plans don't cover implants, but we offer 0% EMI over 6 months through Bajaj Finserv. Dr. Kavya's team can walk you through it tomorrow." },
  { id: "t18", speaker: "customer", offsetSec: 124, text: "Great, thanks Maya." },
  { id: "t19", speaker: "ai", offsetSec: 127, text: "You're welcome, Rahul. See you tomorrow at 11:30. Have a great day!" },
];

const priyaTranscript: TranscriptTurn[] = [
  { id: "p1", speaker: "ai", offsetSec: 0, text: "Hi, thank you for calling Apex Dental Care. I'm Maya. How can I help you today?" },
  { id: "p2", speaker: "customer", offsetSec: 5, text: "Hello, I wanted to know about teeth whitening. How much does it cost?", highlights: [{ text: "teeth whitening", kind: "intent" }] },
  { id: "p3", speaker: "ai", offsetSec: 11, text: "Of course. We offer in-clinic laser whitening at ₹12,000 and a take-home kit at ₹6,500. The in-clinic session takes about an hour. Are you preparing for an event?" },
  { id: "p4", speaker: "customer", offsetSec: 22, text: "Yes, my sister's wedding is in three weeks.", highlights: [{ text: "three weeks", kind: "timeline" }] },
  { id: "p5", speaker: "ai", offsetSec: 27, text: "Congratulations! In that case the in-clinic session is ideal — results last longer and you'd see the full effect within a day. May I have your name?" },
  { id: "p6", speaker: "customer", offsetSec: 36, text: "Priya Reddy. But 12,000 feels a bit high, honestly.", highlights: [{ text: "12,000 feels a bit high", kind: "objection" }] },
  { id: "p7", speaker: "ai", offsetSec: 42, text: "I understand, Priya. This month we have a wedding-season package — laser whitening plus a polish for ₹9,900. Would you like me to hold a slot for you?" },
  { id: "p8", speaker: "customer", offsetSec: 53, text: "Hmm, let me think about it and check with my sister. Can you send me the details?" },
  { id: "p9", speaker: "ai", offsetSec: 59, text: "Absolutely. I'll send the package details on WhatsApp to this number. Shall I also call you back in a couple of days to check?" },
  { id: "p10", speaker: "customer", offsetSec: 67, text: "Sure, that's fine." },
  { id: "p11", speaker: "ai", offsetSec: 70, text: "Done. Sending the details now — talk soon, Priya!" },
];

const arjunTranscript: TranscriptTurn[] = [
  { id: "a1", speaker: "ai", offsetSec: 0, text: "Hello, this is Arjun from Skyline Realty. You enquired about Skyline Meadows on 99acres — is now a good time to talk?" },
  { id: "a2", speaker: "customer", offsetSec: 7, text: "Yes, go ahead. I was looking at the 3BHK units.", highlights: [{ text: "3BHK", kind: "intent" }] },
  { id: "a3", speaker: "ai", offsetSec: 12, text: "Great choice. The 3BHKs at Meadows are 1,650 to 1,820 square feet, priced between ₹1.35 and ₹1.6 crore. What budget range are you working with?" },
  { id: "a4", speaker: "customer", offsetSec: 24, text: "Up to 1.5 crore, including registration ideally.", highlights: [{ text: "1.5 crore", kind: "budget" }] },
  { id: "a5", speaker: "ai", offsetSec: 30, text: "That covers the mid-floor units comfortably. Are you looking at this for self-use or investment, and when are you planning to move?" },
  { id: "a6", speaker: "customer", offsetSec: 38, text: "Self-use. We'd like possession within a year — our lease ends next August.", highlights: [{ text: "within a year", kind: "timeline" }] },
  { id: "a7", speaker: "ai", offsetSec: 46, text: "Tower B is ready to move in, so that works. Will you be financing through a home loan? We have tie-ups with HDFC and SBI for pre-approved rates." },
  { id: "a8", speaker: "customer", offsetSec: 55, text: "Yes, we'll take a loan for about 60 percent." },
  { id: "a9", speaker: "ai", offsetSec: 60, text: "Perfect. I'd recommend a site visit — our experience centre is open this Saturday at 11 AM or Sunday at 3 PM. Which suits you, Mr. Patel?" },
  { id: "a10", speaker: "customer", offsetSec: 70, text: "Saturday 11 is good." },
  { id: "a11", speaker: "ai", offsetSec: 74, text: "Booked. I'll send the location and a brochure on WhatsApp. Our sales manager Divya will meet you there. Anything else I can answer?" },
  { id: "a12", speaker: "customer", offsetSec: 84, text: "Is there a clubhouse and how far is the metro?" },
  { id: "a13", speaker: "ai", offsetSec: 88, text: "There's a 24,000 sq ft clubhouse with a pool and gym, and Raidurg metro is 1.8 km away — about 6 minutes by car. See you Saturday!" },
];

const snehaTranscript: TranscriptTurn[] = [
  { id: "s1", speaker: "ai", offsetSec: 0, text: "Hi, you've reached Apex Dental Care support. I'm Nisha. What can I help you with?" },
  { id: "s2", speaker: "customer", offsetSec: 5, text: "Hi, I had a root canal done on Monday and there's still some sensitivity when I drink cold water. Is that normal?", highlights: [{ text: "root canal", kind: "intent" }] },
  { id: "s3", speaker: "ai", offsetSec: 14, text: "Thanks for letting us know, Sneha. Mild sensitivity for up to a week after a root canal is common, especially before the permanent crown is placed. Is the pain sharp, or a dull ache?" },
  { id: "s4", speaker: "customer", offsetSec: 25, text: "More of a dull ache. It goes away in a few seconds." },
  { id: "s5", speaker: "ai", offsetSec: 30, text: "That sounds within the normal recovery range. Avoid very hot or cold drinks for a few more days and continue the prescribed medication. If the pain becomes sharp, persists, or you notice swelling, please call us immediately — that would need Dr. Kavya's attention." },
  { id: "s6", speaker: "customer", offsetSec: 46, text: "Okay. And when is my crown appointment?" },
  { id: "s7", speaker: "ai", offsetSec: 50, text: "Your crown fitting is scheduled for next Tuesday at 5:00 PM with Dr. Kavya. I'll send a reminder the day before. Anything else?" },
  { id: "s8", speaker: "customer", offsetSec: 58, text: "No, that's all. Thank you." },
  { id: "s9", speaker: "ai", offsetSec: 61, text: "Take care, Sneha. Wishing you a quick recovery!" },
];

export const featuredCalls: Call[] = [
  {
    id: "call_rahul",
    organizationId: ORG_ID,
    workspaceId: WORKSPACE_ID,
    agentId: "agt_maya",
    agentName: "Maya — Dental Receptionist",
    contactId: "ct_rahul",
    leadId: "lead_rahul",
    customerName: "Rahul Sharma",
    customerPhone: "+91 98491 22334",
    phoneNumberId: "pn_1",
    phoneNumber: "+91 40 6969 1200",
    direction: "inbound",
    status: "completed",
    outcome: "booked",
    objective: "Qualify new patient and book consultation",
    durationSec: 132,
    leadScore: 92,
    sentiment: "positive",
    intent: "Dental Implant Consultation",
    appointmentStatus: "booked",
    recordingUrl: "/recordings/call_rahul.mp3",
    startedAt: hoursAgo(1, 21),
    endedAt: addMinutes(hoursAgo(1, 21), 2),
    costMinutes: 2.2,
    transcript: rahulTranscript,
    summary: {
      summary: "Rahul Sharma called about a single dental implant to replace a molar lost a few months ago. Budget ₹40–50K, wants to start immediately due to chewing difficulty. Consultation booked with Dr. Kavya Nair for tomorrow 11:30 AM at Banjara Hills.",
      intent: "Single dental implant — molar replacement",
      painPoints: ["Difficulty chewing on affected side", "Concerned about implant cost and insurance"],
      requirements: ["Single implant now, possibly a second later", "Banjara Hills clinic", "EMI option"],
      budget: "₹40,000 – ₹50,000",
      timeline: "Immediate (within 1 week)",
      leadQuality: "hot",
      nextAction: "Schedule consultation within 24 hours — booked. Send EMI details before the visit.",
      appointment: "Tomorrow, 11:30 AM — Dr. Kavya Nair (Banjara Hills)",
      sentiment: "positive",
    },
    insights: {
      intent: "Dental implant consultation",
      buyingProbability: 88,
      sentiment: "positive",
      urgency: "high",
      objections: ["Insurance coverage"],
      competitorMentions: [],
      suggestedNextAction: "Send EMI brochure on WhatsApp; confirm 3D scan slot with Dr. Kavya.",
    },
    events: [
      { id: "ev1", at: hoursAgo(1, 21), type: "call.started", description: "Inbound call received on +91 40 6969 1200" },
      { id: "ev2", at: addMinutes(hoursAgo(1, 21), 0.4), type: "intent.detected", description: "Intent: Dental Implant Consultation" },
      { id: "ev3", at: addMinutes(hoursAgo(1, 21), 1.1), type: "lead.qualified", description: "Lead score 92 — Hot lead" },
      { id: "ev4", at: addMinutes(hoursAgo(1, 21), 1.6), type: "appointment.booked", description: "Google Calendar — Dr. Kavya Nair, tomorrow 11:30 AM" },
      { id: "ev5", at: addMinutes(hoursAgo(1, 21), 2), type: "call.ended", description: "Call completed — 02:12" },
      { id: "ev6", at: addMinutes(hoursAgo(1, 21), 2.2), type: "whatsapp.sent", description: "Booking confirmation sent via WhatsApp" },
      { id: "ev7", at: addMinutes(hoursAgo(1, 21), 2.3), type: "crm.updated", description: "HubSpot contact created and stage set to Appointment Booked" },
    ],
  },
  {
    id: "call_priya",
    organizationId: ORG_ID,
    workspaceId: WORKSPACE_ID,
    agentId: "agt_maya",
    agentName: "Maya — Dental Receptionist",
    contactId: "ct_priya",
    leadId: "lead_priya",
    customerName: "Priya Reddy",
    customerPhone: "+91 99630 77812",
    phoneNumberId: "pn_1",
    phoneNumber: "+91 40 6969 1200",
    direction: "inbound",
    status: "completed",
    outcome: "callback_requested",
    objective: "Answer pricing enquiry and book",
    durationSec: 74,
    leadScore: 68,
    sentiment: "neutral",
    intent: "Teeth Whitening Pricing",
    appointmentStatus: "pending",
    recordingUrl: "/recordings/call_priya.mp3",
    startedAt: hoursAgo(3, 5),
    endedAt: addMinutes(hoursAgo(3, 5), 1.3),
    costMinutes: 1.3,
    transcript: priyaTranscript,
    summary: {
      summary: "Priya Reddy enquired about teeth whitening cost ahead of her sister's wedding in three weeks. Raised a price objection at ₹12,000; Maya offered the ₹9,900 wedding-season package. Priya asked for details on WhatsApp and agreed to a callback.",
      intent: "Teeth whitening before an event",
      painPoints: ["Price sensitivity"],
      requirements: ["Results within 3 weeks", "Package details on WhatsApp"],
      budget: "Under ₹10,000",
      timeline: "Within 3 weeks",
      leadQuality: "warm",
      nextAction: "Follow-up call in 2 days; send wedding package details on WhatsApp.",
      sentiment: "neutral",
    },
    insights: {
      intent: "Teeth whitening",
      buyingProbability: 61,
      sentiment: "neutral",
      urgency: "medium",
      objections: ["Price too high"],
      competitorMentions: [],
      suggestedNextAction: "Enrol in 'Warm lead follow-up' sequence; offer package with limited-time expiry.",
    },
    events: [
      { id: "ev1", at: hoursAgo(3, 5), type: "call.started", description: "Inbound call received" },
      { id: "ev2", at: addMinutes(hoursAgo(3, 5), 0.6), type: "objection.detected", description: "Price objection detected" },
      { id: "ev3", at: addMinutes(hoursAgo(3, 5), 1.3), type: "call.ended", description: "Call completed — 01:14" },
      { id: "ev4", at: addMinutes(hoursAgo(3, 5), 1.4), type: "whatsapp.sent", description: "Wedding package details sent" },
      { id: "ev5", at: addMinutes(hoursAgo(3, 5), 1.5), type: "followup.scheduled", description: "Callback scheduled in 2 days via Ravi" },
    ],
  },
  {
    id: "call_arjun_patel",
    organizationId: ORG_ID,
    workspaceId: WORKSPACE_ID,
    agentId: "agt_arjun",
    agentName: "Arjun — Real Estate Lead Agent",
    contactId: "ct_arjun",
    leadId: "lead_arjun",
    customerName: "Arjun Patel",
    customerPhone: "+91 98200 45671",
    phoneNumberId: "pn_2",
    phoneNumber: "+91 40 6969 1201",
    direction: "outbound",
    status: "completed",
    outcome: "booked",
    objective: "Qualify portal lead and book site visit",
    durationSec: 98,
    leadScore: 85,
    sentiment: "positive",
    intent: "3BHK Purchase — Skyline Meadows",
    appointmentStatus: "booked",
    recordingUrl: "/recordings/call_arjun.mp3",
    startedAt: daysAgo(1, 16, 42),
    endedAt: addMinutes(daysAgo(1, 16, 42), 1.6),
    costMinutes: 1.6,
    campaignId: "cmp_portal_followup",
    transcript: arjunTranscript,
    summary: {
      summary: "Outbound follow-up on a 99acres enquiry. Arjun Patel is a self-use buyer with a ₹1.5Cr budget and needs possession within 12 months. Financing ~60% via home loan. Site visit booked Saturday 11 AM at the experience centre.",
      intent: "3BHK purchase for self-use",
      painPoints: ["Lease ending next August"],
      requirements: ["Ready-to-move", "Metro proximity", "Clubhouse"],
      budget: "Up to ₹1.5 Cr",
      timeline: "Possession within 12 months",
      leadQuality: "hot",
      nextAction: "Assign to Divya; send Tower B brochure and loan pre-approval form.",
      appointment: "Saturday, 11:00 AM — Skyline Experience Centre",
      sentiment: "positive",
    },
    insights: {
      intent: "Property purchase",
      buyingProbability: 82,
      sentiment: "positive",
      urgency: "high",
      objections: [],
      competitorMentions: [],
      suggestedNextAction: "Pre-fill loan eligibility with HDFC before the visit.",
    },
    events: [
      { id: "ev1", at: daysAgo(1, 16, 42), type: "call.started", description: "Outbound call — Campaign: Portal Lead Follow-up" },
      { id: "ev2", at: addMinutes(daysAgo(1, 16, 42), 1.0), type: "lead.qualified", description: "Lead score 85 — Hot lead" },
      { id: "ev3", at: addMinutes(daysAgo(1, 16, 42), 1.3), type: "appointment.booked", description: "Site visit booked — Saturday 11:00 AM" },
      { id: "ev4", at: addMinutes(daysAgo(1, 16, 42), 1.6), type: "call.ended", description: "Call completed — 01:38" },
    ],
  },
  {
    id: "call_sneha",
    organizationId: ORG_ID,
    workspaceId: WORKSPACE_ID,
    agentId: "agt_nisha",
    agentName: "Nisha — Customer Support Agent",
    contactId: "ct_sneha",
    leadId: "lead_sneha",
    customerName: "Sneha Kapoor",
    customerPhone: "+91 98110 33420",
    phoneNumberId: "pn_3",
    phoneNumber: "+91 40 6969 1202",
    direction: "inbound",
    status: "completed",
    outcome: "answered_question",
    objective: "Post-treatment support",
    durationSec: 65,
    leadScore: 40,
    sentiment: "positive",
    intent: "Post root canal sensitivity",
    appointmentStatus: "none",
    recordingUrl: "/recordings/call_sneha.mp3",
    startedAt: daysAgo(0, 9, 12),
    endedAt: addMinutes(daysAgo(0, 9, 12), 1.1),
    costMinutes: 1.1,
    transcript: snehaTranscript,
    summary: {
      summary: "Existing patient Sneha Kapoor reported mild cold sensitivity after Monday's root canal. Nisha confirmed this is within normal recovery, gave care instructions and confirmed her crown fitting next Tuesday at 5 PM.",
      intent: "Post-treatment concern",
      painPoints: ["Cold sensitivity after root canal"],
      requirements: ["Reassurance", "Appointment confirmation"],
      leadQuality: "not_qualified",
      nextAction: "Send reminder before crown fitting; flag for dentist if she calls again.",
      sentiment: "positive",
    },
    insights: {
      intent: "Support — post-treatment",
      buyingProbability: 15,
      sentiment: "positive",
      urgency: "low",
      objections: [],
      competitorMentions: [],
      suggestedNextAction: "No sales action. Resolved by AI without escalation.",
    },
    events: [
      { id: "ev1", at: daysAgo(0, 9, 12), type: "call.started", description: "Inbound call received" },
      { id: "ev2", at: addMinutes(daysAgo(0, 9, 12), 0.5), type: "knowledge.used", description: "Answered from: Post-treatment care guide.pdf" },
      { id: "ev3", at: addMinutes(daysAgo(0, 9, 12), 1.1), type: "call.ended", description: "Resolved by AI — no escalation" },
    ],
  },
];

/* Generated history for tables & analytics — deterministic. */
const names = [
  "Vikram Rao", "Ananya Iyer", "Karthik Reddy", "Divya Menon", "Suresh Kumar", "Lakshmi Naidu", "Aditya Verma",
  "Pooja Agarwal", "Nikhil Joshi", "Shreya Das", "Manoj Pillai", "Kavitha Bhat", "Rohit Malhotra", "Neha Kulkarni",
  "Farhan Ali", "Ritika Sen", "Sandeep Gupta", "Meghana Chowdary", "Harish Babu", "Ishita Roy", "Abhishek Nair",
  "Tanvi Shah", "Yash Trivedi", "Sunita Pawar", "Girish Hegde", "Nandini Rao", "Pranav Mishra", "Bhavana Reddy",
  "Deepak Sharma", "Swati Jain", "Mahesh Yadav", "Aparna Menon", "Kiran Kumar", "Radhika Iyer", "Varun Sethi",
];
const intents = [
  "Dental Implant Consultation", "Teeth Whitening", "Braces / Aligners", "Root Canal", "Routine Check-up",
  "Emergency Toothache", "Wisdom Tooth Extraction", "Pediatric Dentistry", "Crown Replacement", "Insurance Query",
  "Appointment Reschedule", "3BHK Purchase Enquiry", "2BHK Rental Enquiry", "Site Visit Booking",
];
const outcomes: CallOutcome[] = ["qualified", "booked", "booked", "answered_question", "qualified", "not_interested", "callback_requested", "transferred", "voicemail", "missed", "failed", "booked", "qualified"];
const sentiments: Sentiment[] = ["positive", "positive", "neutral", "positive", "negative", "neutral"];

function statusFor(o: CallOutcome): CallStatus {
  if (o === "missed") return "missed";
  if (o === "failed") return "failed";
  if (o === "voicemail") return "voicemail";
  if (o === "transferred") return "transferred";
  return "completed";
}

const rand = seeded(20260917);
export const generatedCalls: Call[] = Array.from({ length: 120 }).map((_, i) => {
  const name = names[i % names.length];
  const outcome = outcomes[Math.floor(rand() * outcomes.length)];
  const agentIdx = Math.floor(rand() * 3);
  const agent = [
    { id: "agt_maya", name: "Maya — Dental Receptionist", pn: "pn_1", num: "+91 40 6969 1200" },
    { id: "agt_arjun", name: "Arjun — Real Estate Lead Agent", pn: "pn_2", num: "+91 40 6969 1201" },
    { id: "agt_nisha", name: "Nisha — Customer Support Agent", pn: "pn_3", num: "+91 40 6969 1202" },
  ][agentIdx];
  const direction = rand() > 0.68 ? "outbound" : "inbound";
  const status = statusFor(outcome);
  const duration = status === "completed" || status === "transferred" ? Math.floor(45 + rand() * 360) : status === "voicemail" ? 22 : 0;
  const leadScore = outcome === "booked" ? 75 + Math.floor(rand() * 25) : outcome === "qualified" ? 55 + Math.floor(rand() * 30) : outcome === "not_interested" ? Math.floor(rand() * 30) : 20 + Math.floor(rand() * 40);
  const dayOffset = Math.floor(rand() * 30);
  const hour = 9 + Math.floor(rand() * 10);
  const minute = Math.floor(rand() * 60);
  const startedAt = daysAgo(dayOffset, hour, minute);
  const sentiment = outcome === "not_interested" ? "negative" : sentiments[Math.floor(rand() * sentiments.length)];
  const intent = agent.id === "agt_arjun" ? intents[11 + Math.floor(rand() * 3)] : intents[Math.floor(rand() * 11)];
  return {
    id: `call_${1000 + i}`,
    organizationId: ORG_ID,
    workspaceId: WORKSPACE_ID,
    agentId: agent.id,
    agentName: agent.name,
    customerName: name,
    customerPhone: `+91 9${String(8000000000 + Math.floor(rand() * 199999999)).slice(0, 9)}`,
    phoneNumberId: agent.pn,
    phoneNumber: agent.num,
    direction,
    status,
    outcome,
    objective: direction === "inbound" ? "Answer enquiry and qualify" : "Follow up and book",
    durationSec: duration,
    leadScore,
    sentiment,
    intent,
    appointmentStatus: outcome === "booked" ? "booked" : outcome === "callback_requested" ? "pending" : "none",
    recordingUrl: duration > 0 ? `/recordings/call_${1000 + i}.mp3` : undefined,
    startedAt,
    endedAt: duration > 0 ? addMinutes(startedAt, duration / 60) : undefined,
    costMinutes: Math.round((duration / 60) * 10) / 10,
    campaignId: direction === "outbound" ? (rand() > 0.5 ? "cmp_portal_followup" : "cmp_unbooked_leads") : undefined,
  };
});

export const calls: Call[] = [...featuredCalls, ...generatedCalls].sort(
  (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
);

export const liveCalls: LiveCall[] = [
  {
    id: "live_1",
    agentId: "agt_maya",
    agentName: "Maya — Dental Receptionist",
    customerName: "Rahul Sharma",
    customerPhone: "+91 98491 22334",
    startedAt: minutesAgo(3.7),
    durationSec: 222,
    stage: "QUALIFYING LEAD",
    intent: "Dental Implant Consultation",
    sentiment: "positive",
    transcript: rahulTranscript.slice(0, 10),
  },
  {
    id: "live_2",
    agentId: "agt_arjun",
    agentName: "Arjun — Real Estate Lead Agent",
    customerName: "Meghana Chowdary",
    customerPhone: "+91 98661 20933",
    startedAt: minutesAgo(1.2),
    durationSec: 72,
    stage: "IDENTIFYING INTENT",
    intent: "2BHK Rental Enquiry",
    sentiment: "neutral",
    transcript: [
      { id: "l1", speaker: "ai", offsetSec: 0, text: "Hello, this is Arjun from Skyline Realty. You enquired about a 2BHK in Gachibowli — is now a good time?" },
      { id: "l2", speaker: "customer", offsetSec: 6, text: "Yes, I'm looking for something semi-furnished, close to the DLF office." },
      { id: "l3", speaker: "ai", offsetSec: 12, text: "We have three semi-furnished 2BHKs within 2 km of DLF Cyber City. What monthly budget are you considering?" },
    ],
  },
  {
    id: "live_3",
    agentId: "agt_nisha",
    agentName: "Nisha — Customer Support Agent",
    customerName: "Harish Babu",
    customerPhone: "+91 97012 55810",
    startedAt: minutesAgo(0.5),
    durationSec: 31,
    stage: "GREETING",
    intent: "Insurance Query",
    sentiment: "neutral",
    transcript: [
      { id: "l1", speaker: "ai", offsetSec: 0, text: "Hi, you've reached Apex Dental Care support. I'm Nisha. What can I help you with?" },
      { id: "l2", speaker: "customer", offsetSec: 5, text: "I need help with a claim form for my cleaning last week." },
    ],
  },
];
