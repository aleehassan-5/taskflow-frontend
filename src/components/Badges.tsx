import React from "react";
import type { Status, Priority, HireStatus } from "../types";

const STATUS_META: Record<Status, { label: string; dot: string; bg: string; text: string }> = {
  PENDING: { label: "Pending", dot: "bg-textMuted", bg: "bg-surfaceHover", text: "text-textMuted" },
  IN_PROGRESS: { label: "In Progress", dot: "bg-primary", bg: "bg-primary/10", text: "text-primary" },
  COMPLETED: { label: "Completed", dot: "bg-success", bg: "bg-success/10", text: "text-success" },
};

const PRIORITY_META: Record<Priority, { label: string; bg: string; text: string }> = {
  LOW: { label: "Low", bg: "bg-surfaceHover", text: "text-textMuted" },
  MEDIUM: { label: "Medium", bg: "bg-warning/10", text: "text-warning" },
  HIGH: { label: "High", bg: "bg-danger/10", text: "text-danger" },
};

export function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium ${meta.bg} ${meta.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority];
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${meta.bg} ${meta.text}`}>
      {meta.label}
    </span>
  );
}

export function Avatar({
  name,
  initials,
  size = "md",
}: {
  name: string;
  initials?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const dims = size === "sm" ? "h-6 w-6 text-[10px]" : size === "lg" ? "h-10 w-10 text-sm" : "h-8 w-8 text-xs";
  const text = initials || name.slice(0, 2).toUpperCase();
  return (
    <div
      className={`flex ${dims} shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary`}
      title={name}
    >
      {text}
    </div>
  );
}

const HIRE_STATUS_META: Record<HireStatus, { label: string; dot: string; bg: string; text: string }> = {
  INTERVIEWING: { label: "Interviewing", dot: "bg-primary", bg: "bg-primary/10", text: "text-primary" },
  HIRED: { label: "Hired", dot: "bg-success", bg: "bg-success/10", text: "text-success" },
  ONBOARDING: { label: "Onboarding", dot: "bg-warning", bg: "bg-warning/10", text: "text-warning" },
  ACTIVE: { label: "Active", dot: "bg-success", bg: "bg-success/10", text: "text-success" },
  ON_HOLD: { label: "On Hold", dot: "bg-textMuted", bg: "bg-surfaceHover", text: "text-textMuted" },
  REJECTED: { label: "Rejected", dot: "bg-danger", bg: "bg-danger/10", text: "text-danger" },
};

export function HireStatusBadge({ status }: { status: HireStatus }) {
  const meta = HIRE_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium ${meta.bg} ${meta.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export const STATUS_OPTIONS: Status[] = ["PENDING", "IN_PROGRESS", "COMPLETED"];
export const PRIORITY_OPTIONS: Priority[] = ["LOW", "MEDIUM", "HIGH"];
export const HIRE_STATUS_OPTIONS: HireStatus[] = [
  "INTERVIEWING",
  "HIRED",
  "ONBOARDING",
  "ACTIVE",
  "ON_HOLD",
  "REJECTED",
];
export { STATUS_META, PRIORITY_META, HIRE_STATUS_META };
