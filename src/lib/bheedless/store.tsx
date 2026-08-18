import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  SECTORS,
  buildServices,
  serviceId,
  type SectorId,
  type ServiceDef,
} from "./data";
import { addMinutes, canCancel, formatTime, predictWait } from "./engine";

export type Role = "user" | "staff" | "admin";
export type Accessibility = "none" | "senior" | "disability";

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  country: string;
  avatarUrl?: string;
  role: Role;
  createdAt: string;
  accessibility: Accessibility;
  guardianName?: string;
  guardianPhone?: string;
  verified: boolean;
  noShowStrikes: number;
}

export interface Token {
  id: string;
  number: string;
  numeric: string | number;
  serviceId: string;
  sectorId: SectorId;
  serviceName: string;
  status: "waiting" | "serving" | "completed" | "cancelled";
  priority: boolean;
  joinedAt: string;
  positionAtJoin: number;
  holder: string;
}

export interface Appointment {
  id: string;
  sectorId: SectorId;
  serviceId: string;
  serviceName: string;
  date: string; // ISO yyyy-mm-dd
  time: string; // HH:mm
  status: "upcoming" | "completed" | "cancelled";
  estimatedWait: number;
  createdAt: string;
  holder: string;
  guardianNotified?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "queue" | "appointment" | "ai" | "alert" | "guardian";
  read: boolean;
  createdAt: string;
}

interface State {
  services: Record<string, ServiceDef>;
  user: Profile | null;
  tokens: Token[];
  appointments: Appointment[];
  notifications: Notification[];
  surgeActive: boolean;
  hydrated: boolean;
}

const STORAGE_KEY = "bheedless.state.v1";

const nowISO = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10);

export const DEMO_USER: Profile = {
  id: "demo-user",
  fullName: "Ananya Deshmukh",
  email: "ananya@bheedless.in",
  phone: "+91 98220 41077",
  dateOfBirth: "1998-04-12",
  address: "402, Sunrise Residency, Baner Road",
  city: "Pune",
  state: "Maharashtra",
  country: "India",
  role: "user",
  createdAt: "2026-01-09T10:12:00.000Z",
  accessibility: "none",
  verified: true,
  noShowStrikes: 0,
};

export const DEMO_STAFF: Profile = {
  ...DEMO_USER,
  id: "demo-staff",
  fullName: "Rohit Kulkarni",
  email: "rohit.staff@bheedless.in",
  role: "staff",
};

export const DEMO_ADMIN: Profile = {
  ...DEMO_USER,
  id: "demo-admin",
  fullName: "Meera Nair",
  email: "meera.ops@bheedless.in",
  role: "admin",
};

function seedNotifications(): Notification[] {
  const base = Date.now();
  return [
    {
      id: uid(),
      title: "AI prediction updated",
      message: "Your estimated waiting time changed from 22 minutes to 18 minutes.",
      type: "ai",
      read: false,
      createdAt: new Date(base - 4 * 60000).toISOString(),
    },
    {
      id: uid(),
      title: "Appointment confirmed",
      message: "Your appointment is confirmed for 11:30 AM.",
      type: "appointment",
      read: false,
      createdAt: new Date(base - 42 * 60000).toISOString(),
    },
    {
      id: uid(),
      title: "Crowd surge detected",
      message: "High crowd levels are currently detected at Sunrise Hospital.",
      type: "alert",
      read: false,
      createdAt: new Date(base - 95 * 60000).toISOString(),
    },
    {
      id: uid(),
      title: "Your token is approaching",
      message: "Only 2 people are ahead of you.",
      type: "queue",
      read: true,
      createdAt: new Date(base - 26 * 3600000).toISOString(),
    },
  ];
}

function seedAppointments(): Appointment[] {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const tomorrow = new Date(today.getTime() + 86400000);
  const past = new Date(today.getTime() - 5 * 86400000);
  const soon = new Date(today.getTime() + 40 * 60000);
  const hh = `${String(soon.getHours()).padStart(2, "0")}:${String(soon.getMinutes()).padStart(2, "0")}`;
  return [
    {
      id: "APT-2026-1047",
      sectorId: "passport",
      serviceId: serviceId("passport", "Document Verification"),
      serviceName: "Document Verification",
      date: iso(today),
      time: hh,
      status: "upcoming",
      estimatedWait: 12,
      createdAt: nowISO(),
      holder: DEMO_USER.fullName,
    },
    {
      id: "APT-2026-1102",
      sectorId: "bank",
      serviceId: serviceId("bank", "KYC"),
      serviceName: "KYC",
      date: iso(tomorrow),
      time: "10:30",
      status: "upcoming",
      estimatedWait: 9,
      createdAt: nowISO(),
      holder: DEMO_USER.fullName,
    },
    {
      id: "APT-2026-0894",
      sectorId: "hospital",
      serviceId: serviceId("hospital", "Laboratory"),
      serviceName: "Laboratory",
      date: iso(past),
      time: "09:30",
      status: "completed",
      estimatedWait: 8,
      createdAt: nowISO(),
      holder: DEMO_USER.fullName,
    },
  ];
}

function initialState(): State {
  return {
    services: buildServices(),
    user: null,
    tokens: [],
    appointments: seedAppointments(),
    notifications: seedNotifications(),
    surgeActive: false,
    hydrated: false,
  };
}

interface Ctx extends State {
  sectorStats: (sectorId: SectorId) => {
    waiting: number;
    avgWait: number;
    activeCounters: number;
    counters: number;
    slots: number;
  };
  servicesBySector: (sectorId: SectorId) => ServiceDef[];
  login: (profile: Profile) => void;
  logout: () => void;
  updateProfile: (patch: Partial<Profile>) => void;
  joinQueue: (svcId: string, priority?: boolean) => Token | null;
  leaveQueue: (tokenId: string) => void;
  bookAppointment: (input: {
    sectorId: SectorId;
    serviceId: string;
    serviceName: string;
    date: string;
    time: string;
  }) => Appointment | null;
  cancelAppointment: (id: string) => boolean;
  markAllRead: () => void;
  markRead: (id: string) => void;
  pushNotification: (n: Omit<Notification, "id" | "read" | "createdAt">) => void;
  simulateSurge: () => void;
  activateCounter: (svcId: string) => void;
  callNext: (svcId: string) => void;
  resetDemo: () => void;
  activeToken: Token | null;
  unreadCount: number;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);

  // hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<State>;
        setState((s) => ({ ...s, ...parsed, hydrated: true }));
        return;
      }
    } catch {
      /* ignore */
    }
    setState((s) => ({ ...s, hydrated: true }));
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, hydrated: undefined }));
    } catch {
      /* ignore */
    }
  }, [state]);

  const pushNotification = useCallback(
    (n: Omit<Notification, "id" | "read" | "createdAt">) => {
      setState((s) => ({
        ...s,
        notifications: [{ ...n, id: uid(), read: false, createdAt: nowISO() }, ...s.notifications],
      }));
    },
    [],
  );

  const servicesBySector = useCallback(
    (sectorId: SectorId) => Object.values(state.services).filter((s) => s.sectorId === sectorId),
    [state.services],
  );

  const sectorStats = useCallback(
    (sectorId: SectorId) => {
      const list = Object.values(state.services).filter((s) => s.sectorId === sectorId);
      const waiting = list.reduce((a, s) => a + s.waiting, 0);
      const waits = list.map((s) => predictWait(s).minutes);
      const avgWait = waits.length
        ? Math.round(waits.reduce((a, b) => a + b, 0) / waits.length)
        : 0;
      return {
        waiting,
        avgWait,
        activeCounters: list.reduce((a, s) => a + s.activeCounters, 0),
        counters: list.reduce((a, s) => a + s.counters, 0),
        slots: Math.max(4, 40 - Math.round(waiting / 4)),
      };
    },
    [state.services],
  );

  const login = useCallback((profile: Profile) => {
    setState((s) => ({ ...s, user: profile }));
  }, []);

  const logout = useCallback(() => setState((s) => ({ ...s, user: null })), []);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setState((s) => (s.user ? { ...s, user: { ...s.user, ...patch } } : s));
  }, []);

  const joinQueue = useCallback(
    (svcId: string, priority = false) => {
      let created: Token | null = null;
      setState((s) => {
        const svc = s.services[svcId];
        if (!svc || !s.user) return s;
        const sector = SECTORS.find((x) => x.id === svc.sectorId);
        const numeric = svc.lastIssued + 1;
        const token: Token = {
          id: uid(),
          number: `${sector?.prefix ?? "T"}-${numeric}`,
          numeric,
          serviceId: svcId,
          sectorId: svc.sectorId,
          serviceName: svc.name,
          status: "waiting",
          priority,
          joinedAt: nowISO(),
          positionAtJoin: priority ? Math.min(2, svc.waiting) : svc.waiting,
          holder: s.user.fullName,
        };
        created = token;
        return {
          ...s,
          services: {
            ...s.services,
            [svcId]: { ...svc, lastIssued: numeric, waiting: svc.waiting + 1 },
          },
          tokens: [token, ...s.tokens],
          notifications: [
            {
              id: uid(),
              title: priority ? "Priority token issued" : "Digital token issued",
              message: `${token.number} — ${svc.name}. ${
                priority
                  ? "You have been placed in the priority lane and will be called next."
                  : `${token.positionAtJoin} people ahead of you.`
              }`,
              type: "queue",
              read: false,
              createdAt: nowISO(),
            },
            ...s.notifications,
          ],
        };
      });
      return created;
    },
    [],
  );

  const leaveQueue = useCallback((tokenId: string) => {
    setState((s) => {
      const token = s.tokens.find((t) => t.id === tokenId);
      if (!token) return s;
      const svc = s.services[token.serviceId];
      return {
        ...s,
        services: svc
          ? { ...s.services, [svc.id]: { ...svc, waiting: Math.max(0, svc.waiting - 1) } }
          : s.services,
        tokens: s.tokens.map((t) => (t.id === tokenId ? { ...t, status: "cancelled" } : t)),
        notifications: [
          {
            id: uid(),
            title: "You left the queue",
            message: `Token ${token.number} was released. Waiting times for others have been recalculated.`,
            type: "queue",
            read: false,
            createdAt: nowISO(),
          },
          ...s.notifications,
        ],
      };
    });
  }, []);

  const bookAppointment: Ctx["bookAppointment"] = useCallback((input) => {
    let created: Appointment | null = null;
    setState((s) => {
      if (!s.user) return s;
      const activeUpcoming = s.appointments.filter((a) => a.status === "upcoming").length;
      if (activeUpcoming >= 4) {
        toast.error("Booking limit reached", {
          description: "You can hold a maximum of 4 upcoming appointments.",
        });
        return s;
      }
      const svc = s.services[input.serviceId];
      const estimatedWait = svc ? predictWait(svc, Math.round(svc.waiting * 0.35)).minutes : 10;
      const age = s.user.dateOfBirth
        ? (Date.now() - new Date(s.user.dateOfBirth).getTime()) / (365.25 * 86400000)
        : 30;
      const isMinor = age < 18;

      const appt: Appointment = {
        id: `APT-2026-${1000 + Math.floor(Math.random() * 8999)}`,
        sectorId: input.sectorId,
        serviceId: input.serviceId,
        serviceName: input.serviceName,
        date: input.date,
        time: input.time,
        status: "upcoming",
        estimatedWait,
        createdAt: nowISO(),
        holder: s.user.fullName,
        guardianNotified: isMinor,
      };
      created = appt;

      const notes: Notification[] = [
        {
          id: uid(),
          title: "Appointment confirmed",
          message: `${appt.serviceName} on ${appt.date} at ${appt.time}. Appointment ID ${appt.id}.`,
          type: "appointment",
          read: false,
          createdAt: nowISO(),
        },
      ];
      if (isMinor) {
        notes.unshift({
          id: uid(),
          title: "Guardian alert sent",
          message: `This account belongs to a minor. A confirmation was sent to ${
            s.user.guardianName ?? "the registered guardian"
          } (${s.user.guardianPhone ?? "guardian contact"}). The booking stays pending until the guardian approves.`,
          type: "guardian",
          read: false,
          createdAt: nowISO(),
        });
      }

      return { ...s, appointments: [appt, ...s.appointments], notifications: [...notes, ...s.notifications] };
    });
    return created;
  }, []);

  const cancelAppointment = useCallback((id: string) => {
    let ok = false;
    setState((s) => {
      const appt = s.appointments.find((a) => a.id === id);
      if (!appt || appt.status !== "upcoming") return s;
      // Rule enforced in state logic, not only in the UI.
      if (!canCancel(appt.date, appt.time)) {
        ok = false;
        return s;
      }
      ok = true;
      const svc = s.services[appt.serviceId];
      return {
        ...s,
        appointments: s.appointments.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a)),
        services: svc
          ? { ...s.services, [svc.id]: { ...svc, waiting: Math.max(0, svc.waiting - 1) } }
          : s.services,
        notifications: [
          {
            id: uid(),
            title: "Appointment cancelled",
            message: `${appt.id} was cancelled. The slot has been released and waiting times recalculated.`,
            type: "appointment",
            read: false,
            createdAt: nowISO(),
          },
          ...s.notifications,
        ],
      };
    });
    return ok;
  }, []);

  const markAllRead = useCallback(
    () =>
      setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
    [],
  );

  const markRead = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      })),
    [],
  );

  const simulateSurge = useCallback(() => {
    setState((s) => {
      const services = { ...s.services };
      Object.keys(services).forEach((k) => {
        const svc = services[k] as ServiceDef;
        services[k] = { ...svc, waiting: Math.round(svc.waiting * 1.35) + 3 };
      });
      const target = services[serviceId("hospital", "General Consultation")] as ServiceDef;
      const wait = predictWait(target).minutes;
      return {
        ...s,
        surgeActive: true,
        services,
        notifications: [
          {
            id: uid(),
            title: "Crowd surge detected",
            message: `Queue size increased by 35%. Hospital General Consultation wait is now about ${wait} minutes.`,
            type: "alert",
            read: false,
            createdAt: nowISO(),
          },
          {
            id: uid(),
            title: "BheedLess AI recommendation",
            message:
              "Hospital General Consultation is expected to peak around 11:30 AM. Activating Counter #5 is projected to cut the wait significantly.",
            type: "ai",
            read: false,
            createdAt: nowISO(),
          },
          ...s.notifications,
        ],
      };
    });
    toast.warning("Crowd surge simulated", {
      description: "Queues grew by 35%. BheedLess AI has generated a recommendation.",
    });
  }, []);

  const activateCounter = useCallback((svcId: string) => {
    setState((s) => {
      const svc = s.services[svcId];
      if (!svc || svc.activeCounters >= svc.counters) return s;
      const before = predictWait(svc).minutes;
      const updated = { ...svc, activeCounters: svc.activeCounters + 1 };
      const after = predictWait(updated).minutes;
      return {
        ...s,
        surgeActive: false,
        services: { ...s.services, [svcId]: updated },
        notifications: [
          {
            id: uid(),
            title: "Queue conditions have improved",
            message: `Counter #${updated.activeCounters} was activated for ${svc.name}. Your estimated waiting time is now about ${after} minutes (was ${before}).`,
            type: "ai",
            read: false,
            createdAt: nowISO(),
          },
          ...s.notifications,
        ],
      };
    });
  }, []);

  const callNext = useCallback((svcId: string) => {
    setState((s) => {
      const svc = s.services[svcId];
      if (!svc || svc.waiting <= 0) return s;
      return {
        ...s,
        services: {
          ...s.services,
          [svcId]: { ...svc, nowServing: svc.nowServing + 1, waiting: svc.waiting - 1 },
        },
      };
    });
  }, []);

  const resetDemo = useCallback(() => {
    setState({ ...initialState(), hydrated: true });
    toast.success("Demo data reset");
  }, []);

  const activeToken = useMemo(
    () => state.tokens.find((t) => t.status === "waiting" || t.status === "serving") ?? null,
    [state.tokens],
  );

  const unreadCount = useMemo(
    () => state.notifications.filter((n) => !n.read).length,
    [state.notifications],
  );

  const value: Ctx = {
    ...state,
    sectorStats,
    servicesBySector,
    login,
    logout,
    updateProfile,
    joinQueue,
    leaveQueue,
    bookAppointment,
    cancelAppointment,
    markAllRead,
    markRead,
    pushNotification,
    simulateSurge,
    activateCounter,
    callNext,
    resetDemo,
    activeToken,
    unreadCount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export function nextSlots(count = 10, startHour = 9) {
  const out: { time: string; label: string; available: boolean }[] = [];
  for (let i = 0; i < count; i++) {
    const h = startHour + Math.floor((i * 30) / 60);
    const m = (i * 30) % 60;
    const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const d = new Date();
    d.setHours(h, m, 0, 0);
    out.push({ time, label: formatTime(d), available: i % 4 !== 2 });
  }
  return out;
}

export function estimatedTurn(minutes: number) {
  return formatTime(addMinutes(new Date(), minutes));
}
