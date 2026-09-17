import type { Appointment, AppointmentStatus } from "@/types";
import { seeded } from "@/lib/utils";
import { ORG_ID } from "./org";
import { addMinutes, daysAgo, daysFromNow } from "./time";

const featured: Appointment[] = [
  {
    id: "apt_rahul",
    organizationId: ORG_ID,
    leadId: "lead_rahul",
    customerName: "Rahul Sharma",
    customerPhone: "+91 98491 22334",
    service: "Implant Consultation + 3D Scan",
    staff: "Dr. Kavya Nair",
    startsAt: daysFromNow(1, 11, 30),
    endsAt: daysFromNow(1, 12, 15),
    agentId: "agt_maya",
    agentName: "Maya",
    status: "confirmed",
    calendarProvider: "google",
    estimatedValue: 48_000,
    notes: "First visit. CBCT scan reserved.",
  },
  {
    id: "apt_arjun",
    organizationId: ORG_ID,
    leadId: "lead_arjun",
    customerName: "Arjun Patel",
    customerPhone: "+91 98200 45671",
    service: "Site Visit — Skyline Meadows Tower B",
    staff: "Divya Menon",
    startsAt: daysFromNow(2, 11, 0),
    endsAt: daysFromNow(2, 12, 0),
    agentId: "agt_arjun",
    agentName: "Arjun",
    status: "confirmed",
    calendarProvider: "google",
    estimatedValue: 1_50_00_000,
  },
  {
    id: "apt_sneha",
    organizationId: ORG_ID,
    leadId: "lead_sneha",
    customerName: "Sneha Kapoor",
    customerPhone: "+91 98110 33420",
    service: "Crown Fitting",
    staff: "Dr. Kavya Nair",
    startsAt: daysFromNow(5, 17, 0),
    endsAt: daysFromNow(5, 17, 45),
    agentId: "agt_maya",
    agentName: "Maya",
    status: "confirmed",
    calendarProvider: "google",
    estimatedValue: 14_000,
  },
  {
    id: "apt_priya",
    organizationId: ORG_ID,
    leadId: "lead_priya",
    customerName: "Priya Reddy",
    customerPhone: "+91 99630 77812",
    service: "Laser Whitening (Wedding Package)",
    staff: "Dr. Anil Kumar",
    startsAt: daysFromNow(3, 15, 0),
    endsAt: daysFromNow(3, 16, 0),
    agentId: "agt_maya",
    agentName: "Maya",
    status: "pending",
    calendarProvider: "google",
    estimatedValue: 9_900,
    notes: "Tentative — awaiting confirmation after callback.",
  },
];

const people = [
  "Vikram Rao", "Ananya Iyer", "Karthik Reddy", "Divya Menon", "Suresh Kumar", "Lakshmi Naidu", "Aditya Verma", "Pooja Agarwal",
  "Nikhil Joshi", "Shreya Das", "Manoj Pillai", "Kavitha Bhat", "Rohit Malhotra", "Neha Kulkarni", "Farhan Ali", "Ritika Sen",
  "Sandeep Gupta", "Ishita Roy", "Abhishek Nair", "Tanvi Shah", "Yash Trivedi", "Sunita Pawar", "Girish Hegde", "Nandini Rao",
];
const services = [
  ["Routine Check-up & Cleaning", 30, 1_500], ["Implant Consultation", 45, 48_000], ["Aligner Fitting", 40, 65_000], ["Root Canal — Sitting 1", 60, 9_500],
  ["Teeth Whitening", 60, 12_000], ["Wisdom Tooth Extraction", 45, 8_000], ["Pediatric Check-up", 30, 3_500], ["Crown Fitting", 45, 14_000],
  ["Site Visit — Skyline Meadows", 60, 1_42_00_000], ["Site Visit — Skyline Heights", 60, 85_00_000],
] as const;
const staff = ["Dr. Kavya Nair", "Dr. Anil Kumar", "Dr. Ritu Sharma", "Divya Menon"];
const rand = seeded(777);

const generated: Appointment[] = Array.from({ length: 48 }).map((_, i) => {
  const dayOffset = Math.floor(rand() * 28) - 12; // -12 .. +15 days
  const hour = 9 + Math.floor(rand() * 9);
  const minute = rand() > 0.5 ? 0 : 30;
  const [service, mins, value] = services[Math.floor(rand() * services.length)];
  const isRe = service.startsWith("Site Visit");
  const startsAt = dayOffset < 0 ? daysAgo(-dayOffset, hour, minute) : daysFromNow(dayOffset, hour, minute);
  const past = dayOffset < 0;
  const status: AppointmentStatus = past
    ? (["completed", "completed", "completed", "no_show", "cancelled"] as const)[Math.floor(rand() * 5)]
    : (["confirmed", "confirmed", "confirmed", "pending"] as const)[Math.floor(rand() * 4)];
  return {
    id: `apt_${200 + i}`,
    organizationId: ORG_ID,
    leadId: `lead_${100 + (i % 24)}`,
    customerName: people[i % people.length],
    customerPhone: `+91 9${String(7000000000 + Math.floor(rand() * 299999999)).slice(0, 9)}`,
    service,
    staff: isRe ? "Divya Menon" : staff[Math.floor(rand() * 3)],
    startsAt,
    endsAt: addMinutes(startsAt, mins),
    agentId: isRe ? "agt_arjun" : "agt_maya",
    agentName: isRe ? "Arjun" : "Maya",
    status,
    calendarProvider: "google",
    estimatedValue: value,
  };
});

export const appointments: Appointment[] = [...featured, ...generated].sort(
  (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
);
