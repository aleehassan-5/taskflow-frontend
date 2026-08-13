import type { Task, User, UserWithStats, Notification, Status, Priority, Hire, HireStatus, CompensationRange, ActivityEntry, Punishment, PunishmentStatus } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function getToken(): string | null {
  return localStorage.getItem("taskflow_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.error?.message || body.error || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(typeof message === "string" ? message : "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<{ user: User }>("/auth/me"),
  },
  users: {
    list: () => request<{ users: UserWithStats[] }>("/users"),
  },
  tasks: {
    list: (params?: { status?: Status; priority?: Priority; assignedTo?: string; search?: string }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.priority) qs.set("priority", params.priority);
      if (params?.assignedTo) qs.set("assignedTo", params.assignedTo);
      if (params?.search) qs.set("search", params.search);
      const query = qs.toString();
      return request<{ tasks: Task[] }>(`/tasks${query ? `?${query}` : ""}`);
    },
    get: (id: string) => request<{ task: Task }>(`/tasks/${id}`),
    recentActivity: () => request<{ activity: ActivityEntry[] }>("/tasks/activity/recent"),
    create: (data: Partial<Task> & { title: string; assignedToId?: string }) =>
      request<{ task: Task }>("/tasks", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      request<{ task: Task }>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    setStatus: (id: string, status: Status) =>
      request<{ task: Task }>(`/tasks/${id}/status`, { method: "POST", body: JSON.stringify({ status }) }),
    remove: (id: string) => request<{ ok: true }>(`/tasks/${id}`, { method: "DELETE" }),
  },
  notifications: {
    list: () => request<{ notifications: Notification[] }>("/notifications"),
    markRead: (id: string) => request<{ notification: Notification }>(`/notifications/${id}/read`, { method: "POST" }),
    markAllRead: () => request<{ ok: true }>("/notifications/read-all", { method: "POST" }),
  },
  hires: {
    list: (params?: { status?: HireStatus; search?: string }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.search) qs.set("search", params.search);
      const query = qs.toString();
      return request<{ hires: Hire[] }>(`/hires${query ? `?${query}` : ""}`);
    },
    get: (id: string) => request<{ hire: Hire }>(`/hires/${id}`),
    create: (data: Record<string, unknown>) => request<{ hire: Hire }>("/hires", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      request<{ hire: Hire }>(`/hires/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: string) => request<{ ok: true }>(`/hires/${id}`, { method: "DELETE" }),
  },
  punishments: {
    list: (params?: { userId?: string; status?: PunishmentStatus }) => {
      const qs = new URLSearchParams();
      if (params?.userId) qs.set("userId", params.userId);
      if (params?.status) qs.set("status", params.status);
      const query = qs.toString();
      return request<{ punishments: Punishment[] }>(`/punishments${query ? `?${query}` : ""}`);
    },
    create: (data: Record<string, unknown>) =>
      request<{ punishment: Punishment }>("/punishments", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      request<{ punishment: Punishment }>(`/punishments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: string) => request<{ ok: true }>(`/punishments/${id}`, { method: "DELETE" }),
  },
  compensationRanges: {
    list: () => request<{ ranges: CompensationRange[] }>("/compensation-ranges"),
    create: (data: { label: string; isFlat: boolean; minValue: number | null; maxValue: number | null; percentage: number }) =>
      request<{ range: CompensationRange }>("/compensation-ranges", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<{ label: string; isFlat: boolean; minValue: number | null; maxValue: number | null; percentage: number }>) =>
      request<{ range: CompensationRange }>(`/compensation-ranges/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: string) => request<{ ok: true }>(`/compensation-ranges/${id}`, { method: "DELETE" }),
  },
};

export function saveToken(token: string) {
  localStorage.setItem("taskflow_token", token);
}

export function clearToken() {
  localStorage.removeItem("taskflow_token");
}
