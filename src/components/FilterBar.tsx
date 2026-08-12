import React from "react";
import type { Status, Priority } from "../types";

const STATUS_TABS: { value: Status | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

export function FilterBar({
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  due,
  onDueChange,
}: {
  status: Status | "ALL";
  onStatusChange: (s: Status | "ALL") => void;
  priority: Priority | "ALL";
  onPriorityChange: (p: Priority | "ALL") => void;
  due: "ALL" | "OVERDUE" | "WEEK";
  onDueChange: (d: "ALL" | "OVERDUE" | "WEEK") => void;
}) {
  const selectClass =
    "rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-text focus:border-primary";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-1 rounded-md border border-border bg-surface p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onStatusChange(tab.value)}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              status === tab.value ? "bg-primary text-primaryText" : "text-textMuted hover:bg-surfaceHover"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <select
        className={selectClass}
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value as Priority | "ALL")}
      >
        <option value="ALL">All priorities</option>
        <option value="LOW">Low priority</option>
        <option value="MEDIUM">Medium priority</option>
        <option value="HIGH">High priority</option>
      </select>

      <select className={selectClass} value={due} onChange={(e) => onDueChange(e.target.value as any)}>
        <option value="ALL">Any due date</option>
        <option value="OVERDUE">Overdue</option>
        <option value="WEEK">Due this week</option>
      </select>
    </div>
  );
}
