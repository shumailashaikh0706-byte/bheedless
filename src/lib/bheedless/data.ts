import hospitalImg from "@/assets/hospital.jpg";
import bankImg from "@/assets/bank.jpg";
import officeImg from "@/assets/office.jpg";
import collegeImg from "@/assets/college.jpg";
import passportImg from "@/assets/passport.jpg";

export type SectorId = "hospital" | "bank" | "office" | "college" | "passport";
export type CrowdLevel = "Low" | "Medium" | "High";

export interface ServiceDef {
  id: string;
  sectorId: SectorId;
  name: string;
  waiting: number;
  avgServiceTime: number; // minutes
  counters: number;
  activeCounters: number;
  nowServing: number;
  lastIssued: number;
}

export interface SectorDef {
  id: SectorId;
  icon: string;
  name: string;
  tagline: string;
  prefix: string;
  organization: string;
  image: string;
  services: string[];
}

export const SECTORS: SectorDef[] = [
  {
    id: "hospital",
    icon: "🏥",
    name: "Hospital",
    tagline: "Healthcare without unnecessary waiting.",
    prefix: "H",
    organization: "Sunrise Multispeciality Hospital, Pune",
    image: hospitalImg,
    services: [
      "General Consultation",
      "Specialist Consultation",
      "Laboratory",
      "Pharmacy",
      "Billing",
      "Emergency Registration",
    ],
  },
  {
    id: "bank",
    icon: "🏦",
    name: "Bank",
    tagline: "Faster banking. Smarter queues.",
    prefix: "B",
    organization: "Bharat National Bank, MG Road Branch",
    image: bankImg,
    services: [
      "Cash Deposit",
      "Cash Withdrawal",
      "Account Opening",
      "Loan Services",
      "KYC",
      "Customer Support",
    ],
  },
  {
    id: "office",
    icon: "🏢",
    name: "Office",
    tagline: "Smart visitor and service management.",
    prefix: "O",
    organization: "Nexus Corporate Park, Tower B",
    image: officeImg,
    services: [
      "HR Services",
      "IT Support",
      "Administration",
      "Visitor Registration",
      "Document Verification",
    ],
  },
  {
    id: "college",
    icon: "🎓",
    name: "College",
    tagline: "Less waiting for students.",
    prefix: "C",
    organization: "Shivaji Institute of Technology",
    image: collegeImg,
    services: [
      "Admissions",
      "Examination Cell",
      "Fees",
      "Certificates",
      "Student Support",
      "Library Services",
    ],
  },
  {
    id: "passport",
    icon: "🛂",
    name: "Passport & Visa",
    tagline: "Smarter document services.",
    prefix: "P",
    organization: "Regional Passport Seva Kendra",
    image: passportImg,
    services: [
      "Passport Application",
      "Passport Renewal",
      "Document Verification",
      "Visa Application",
      "Biometric Registration",
      "Application Status",
    ],
  },
];

export const getSector = (id: string) => SECTORS.find((s) => s.id === id);

/** slugify a service name into a stable id */
export const serviceId = (sectorId: SectorId, name: string) =>
  `${sectorId}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

const SERVICE_TUNING: Record<
  string,
  { waiting: number; avg: number; counters: number; active: number }
> = {
  "hospital-general-consultation": { waiting: 47, avg: 4.2, counters: 5, active: 4 },
  "hospital-specialist-consultation": { waiting: 22, avg: 7.5, counters: 4, active: 3 },
  "hospital-laboratory": { waiting: 18, avg: 3.4, counters: 3, active: 3 },
  "hospital-pharmacy": { waiting: 26, avg: 2.6, counters: 4, active: 3 },
  "hospital-billing": { waiting: 14, avg: 3.1, counters: 3, active: 2 },
  "hospital-emergency-registration": { waiting: 4, avg: 2.2, counters: 2, active: 2 },
  "bank-cash-deposit": { waiting: 23, avg: 3.2, counters: 4, active: 3 },
  "bank-cash-withdrawal": { waiting: 19, avg: 2.8, counters: 4, active: 3 },
  "bank-account-opening": { waiting: 9, avg: 12.5, counters: 2, active: 2 },
  "bank-loan-services": { waiting: 7, avg: 15, counters: 2, active: 1 },
  "bank-kyc": { waiting: 12, avg: 6, counters: 2, active: 2 },
  "bank-customer-support": { waiting: 11, avg: 5, counters: 3, active: 2 },
  "office-hr-services": { waiting: 8, avg: 8, counters: 2, active: 2 },
  "office-it-support": { waiting: 12, avg: 6.5, counters: 3, active: 2 },
  "office-administration": { waiting: 6, avg: 5, counters: 2, active: 2 },
  "office-visitor-registration": { waiting: 18, avg: 2.4, counters: 3, active: 3 },
  "office-document-verification": { waiting: 9, avg: 4.5, counters: 2, active: 2 },
  "college-admissions": { waiting: 36, avg: 6.8, counters: 4, active: 3 },
  "college-examination-cell": { waiting: 21, avg: 4.6, counters: 3, active: 2 },
  "college-fees": { waiting: 28, avg: 3, counters: 3, active: 3 },
  "college-certificates": { waiting: 16, avg: 5.4, counters: 2, active: 2 },
  "college-student-support": { waiting: 10, avg: 4, counters: 2, active: 2 },
  "college-library-services": { waiting: 7, avg: 2.5, counters: 2, active: 1 },
  "passport-passport-application": { waiting: 31, avg: 9.5, counters: 5, active: 4 },
  "passport-passport-renewal": { waiting: 19, avg: 7, counters: 3, active: 3 },
  "passport-document-verification": { waiting: 24, avg: 6.2, counters: 4, active: 3 },
  "passport-visa-application": { waiting: 17, avg: 11, counters: 3, active: 2 },
  "passport-biometric-registration": { waiting: 22, avg: 4.8, counters: 4, active: 3 },
  "passport-application-status": { waiting: 8, avg: 2.5, counters: 2, active: 2 },
};

export function buildServices(): Record<string, ServiceDef> {
  const out: Record<string, ServiceDef> = {};
  SECTORS.forEach((sector) => {
    sector.services.forEach((name, i) => {
      const id = serviceId(sector.id, name);
      const t = SERVICE_TUNING[id] ?? { waiting: 12, avg: 5, counters: 3, active: 2 };
      const nowServing = 100 + i * 13 + 19;
      out[id] = {
        id,
        sectorId: sector.id,
        name,
        waiting: t.waiting,
        avgServiceTime: t.avg,
        counters: t.counters,
        activeCounters: t.active,
        nowServing,
        lastIssued: nowServing + t.waiting,
      };
    });
  });
  return out;
}

/* ---------- Historical / analytics demo data (labelled as historical) ---------- */

export const HOURS = ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"];

export const sectorAnalytics: Record<
  SectorId,
  {
    kpis: { label: string; value: string }[];
    waitLine: { hour: string; wait: number }[];
    visitorsBar: { day: string; visitors: number }[];
    distribution: { name: string; value: number }[];
    insight: string;
  }
> = {
  hospital: {
    kpis: [
      { label: "Patients served (30d)", value: "12,480" },
      { label: "Avg. consultation wait", value: "18 min" },
      { label: "Peak consultation hours", value: "11 AM – 1 PM" },
      { label: "Avg. service duration", value: "4.2 min" },
    ],
    waitLine: [14, 16, 18, 27, 24, 19, 17, 15, 12].map((wait, i) => ({ hour: HOURS[i] as string, wait })),
    visitorsBar: [
      { day: "Mon", visitors: 480 },
      { day: "Tue", visitors: 520 },
      { day: "Wed", visitors: 610 },
      { day: "Thu", visitors: 495 },
      { day: "Fri", visitors: 570 },
      { day: "Sat", visitors: 720 },
      { day: "Sun", visitors: 240 },
    ],
    distribution: [
      { name: "General", value: 38 },
      { name: "Specialist", value: 21 },
      { name: "Laboratory", value: 17 },
      { name: "Pharmacy", value: 16 },
      { name: "Billing", value: 8 },
    ],
    insight:
      "The busiest period is typically between 11 AM and 1 PM. Adding one temporary consultation counter during this window could reduce average waiting time by around 9 minutes.",
  },
  bank: {
    kpis: [
      { label: "Customers served (30d)", value: "8,210" },
      { label: "Avg. transaction time", value: "3.2 min" },
      { label: "Peak banking hours", value: "12 PM – 2 PM" },
      { label: "Counter utilisation", value: "78%" },
    ],
    waitLine: [8, 11, 14, 19, 21, 16, 12, 10, 7].map((wait, i) => ({ hour: HOURS[i] as string, wait })),
    visitorsBar: [
      { day: "Mon", visitors: 390 },
      { day: "Tue", visitors: 340 },
      { day: "Wed", visitors: 355 },
      { day: "Thu", visitors: 310 },
      { day: "Fri", visitors: 430 },
      { day: "Sat", visitors: 285 },
      { day: "Sun", visitors: 0 },
    ],
    distribution: [
      { name: "Deposit", value: 31 },
      { name: "Withdrawal", value: 27 },
      { name: "KYC", value: 15 },
      { name: "Account Opening", value: 14 },
      { name: "Loans", value: 13 },
    ],
    insight:
      "Cash counters saturate right after lunch. Shifting one KYC officer to deposits between 12 PM and 2 PM would cut peak wait from 21 to about 13 minutes.",
  },
  office: {
    kpis: [
      { label: "Visitors (30d)", value: "3,940" },
      { label: "Avg. service time", value: "5.1 min" },
      { label: "Peak visitor hours", value: "10 AM – 11 AM" },
      { label: "HR / IT / Admin split", value: "34 / 41 / 25" },
    ],
    waitLine: [7, 12, 9, 8, 11, 9, 6, 5, 4].map((wait, i) => ({ hour: HOURS[i] as string, wait })),
    visitorsBar: [
      { day: "Mon", visitors: 210 },
      { day: "Tue", visitors: 185 },
      { day: "Wed", visitors: 172 },
      { day: "Thu", visitors: 190 },
      { day: "Fri", visitors: 205 },
      { day: "Sat", visitors: 60 },
      { day: "Sun", visitors: 0 },
    ],
    distribution: [
      { name: "IT Support", value: 41 },
      { name: "HR", value: 34 },
      { name: "Admin", value: 25 },
    ],
    insight:
      "Monday morning IT support demand is 2.3x the weekly average. A dedicated walk-in slot from 9:30–11:00 AM on Mondays would smooth the queue.",
  },
  college: {
    kpis: [
      { label: "Students served (30d)", value: "9,760" },
      { label: "Admissions traffic", value: "+42% vs. last month" },
      { label: "Examination traffic", value: "1,890 students" },
      { label: "Peak student hours", value: "11 AM – 2 PM" },
    ],
    waitLine: [10, 14, 17, 22, 20, 15, 13, 11, 8].map((wait, i) => ({ hour: HOURS[i] as string, wait })),
    visitorsBar: [
      { day: "Mon", visitors: 420 },
      { day: "Tue", visitors: 390 },
      { day: "Wed", visitors: 455 },
      { day: "Thu", visitors: 410 },
      { day: "Fri", visitors: 480 },
      { day: "Sat", visitors: 300 },
      { day: "Sun", visitors: 0 },
    ],
    distribution: [
      { name: "Admissions", value: 34 },
      { name: "Fees", value: 25 },
      { name: "Exam Cell", value: 19 },
      { name: "Certificates", value: 13 },
      { name: "Library", value: 9 },
    ],
    insight:
      "Fee-deadline weeks triple counter load. Opening online fee payment reminders 5 days earlier historically reduced counter queues by 28%.",
  },
  passport: {
    kpis: [
      { label: "Applications processed (30d)", value: "6,340" },
      { label: "Verification waiting time", value: "11 min" },
      { label: "Appointment utilisation", value: "91%" },
      { label: "Avg. processing time", value: "9.5 min" },
    ],
    waitLine: [9, 11, 14, 18, 16, 13, 11, 9, 7].map((wait, i) => ({ hour: HOURS[i] as string, wait })),
    visitorsBar: [
      { day: "Mon", visitors: 330 },
      { day: "Tue", visitors: 315 },
      { day: "Wed", visitors: 305 },
      { day: "Thu", visitors: 298 },
      { day: "Fri", visitors: 342 },
      { day: "Sat", visitors: 120 },
      { day: "Sun", visitors: 0 },
    ],
    distribution: [
      { name: "New Application", value: 33 },
      { name: "Renewal", value: 22 },
      { name: "Verification", value: 20 },
      { name: "Visa", value: 15 },
      { name: "Biometrics", value: 10 },
    ],
    insight:
      "Appointment utilisation is at 91%. Releasing 15 additional morning slots would absorb the recurring Monday overflow.",
  },
};

export const CROWD_FORECAST = [
  { hour: "10 AM", level: "Low", people: 96 },
  { hour: "11 AM", level: "Moderate", people: 164 },
  { hour: "12 PM", level: "High", people: 268 },
  { hour: "1 PM", level: "High", people: 254 },
  { hour: "2 PM", level: "Moderate", people: 172 },
  { hour: "3 PM", level: "Low", people: 108 },
];

export const DEMO_FIRST_NAMES = [
  "Aarav", "Diya", "Rohan", "Sneha", "Kabir", "Meera", "Arjun", "Ananya",
  "Vivaan", "Isha", "Rahul", "Priya", "Aditya", "Nisha", "Karan", "Tara",
];
export const DEMO_LAST_NAMES = [
  "Sharma", "Patil", "Iyer", "Khan", "Reddy", "Gupta", "Naik", "Joshi",
];
