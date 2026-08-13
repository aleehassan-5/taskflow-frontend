export type Role = "ADMIN" | "MEMBER";
export type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED";
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type HireStatus = "INTERVIEWING" | "HIRED" | "ONBOARDING" | "ACTIVE" | "ON_HOLD" | "REJECTED";
export type CompensationType = "SALARY" | "PERCENTAGE";
export type PunishmentStatus = "PENDING" | "DONE" | "FORGIVEN";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: Role;
  createdAt: string;
}

export interface UserWithStats extends User {
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export interface TaskHistoryEntry {
  id: string;
  action: string;
  createdAt: string;
  by: Pick<User, "id" | "name" | "avatar">;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  dueDate: string | null;
  tags: string[];
  assignedTo: Pick<User, "id" | "name" | "avatar"> | null;
  createdBy: Pick<User, "id" | "name" | "avatar">;
  completedBy: Pick<User, "id" | "name" | "avatar"> | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Populated on the single-task detail fetch. List fetches only include historyCount
  // (via _count) to keep the list endpoint fast — fetch task detail for the full log.
  history?: TaskHistoryEntry[];
  _count?: { history: number };
}

export interface ActivityEntry {
  id: string;
  action: string;
  createdAt: string;
  by: Pick<User, "id" | "name" | "avatar">;
  task: Pick<Task, "id" | "title">;
}

export interface Notification {
  id: string;
  message: string;
  taskId: string | null;
  read: boolean;
  createdAt: string;
}

export interface CompensationRange {
  id: string;
  label: string;
  isFlat: boolean;
  minValue: number | null;
  maxValue: number | null;
  percentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface Hire {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  compensationType: CompensationType;
  compensationValue: number | null;
  compensationRangeIds: string[];
  status: HireStatus;
  source: string | null;
  notes: string | null;
  startDate: string | null;
  addedBy: Pick<User, "id" | "name" | "avatar">;
  createdAt: string;
  updatedAt: string;
}

export interface Punishment {
  id: string;
  reason: string;
  punishment: string;
  status: PunishmentStatus;
  user: Pick<User, "id" | "name" | "avatar">;
  issuedBy: Pick<User, "id" | "name" | "avatar">;
  task: Pick<Task, "id" | "title"> | null;
  createdAt: string;
  updatedAt: string;
}
