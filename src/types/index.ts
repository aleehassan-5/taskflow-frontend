export type Role = "ADMIN" | "MEMBER";
export type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED";
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type HireStatus = "INTERVIEWING" | "HIRED" | "ONBOARDING" | "ACTIVE" | "ON_HOLD" | "REJECTED";
export type CompensationType = "SALARY" | "PERCENTAGE";

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
  history: TaskHistoryEntry[];
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
  minValue: number;
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
  status: HireStatus;
  source: string | null;
  notes: string | null;
  startDate: string | null;
  addedBy: Pick<User, "id" | "name" | "avatar">;
  createdAt: string;
  updatedAt: string;
}
