import React from "react";
import { Check } from "lucide-react";
import type { Task } from "../types";
import { Avatar } from "./Badges";

const PRIORITY_DOT: Record<Task["priority"], string> = {
  LOW: "bg-textMuted",
  MEDIUM: "bg-warning",
  HIGH: "bg-danger",
};

export function CalendarTaskItem({
  task,
  onOpen,
  onToggle,
  onDragStart,
}: {
  task: Task;
  onOpen: (task: Task) => void;
  onToggle: (task: Task) => void;
  onDragStart: (taskId: string) => void;
}) {
  const completed = task.status === "COMPLETED";

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", task.id);
        onDragStart(task.id);
      }}
      onClick={(e) => e.stopPropagation()}
      className="flex cursor-grab items-center gap-1.5 rounded px-1 py-0.5 text-xs hover:bg-surfaceHover active:cursor-grabbing"
      title={task.title}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task);
        }}
        aria-label={completed ? "Reopen task" : "Mark task complete"}
        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors ${
          completed ? "border-success bg-success text-white" : "border-border hover:border-primary"
        }`}
      >
        {completed && <Check size={10} strokeWidth={3} />}
      </button>

      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_DOT[task.priority]}`} aria-hidden="true" />

      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpen(task);
        }}
        className={`min-w-0 flex-1 truncate text-left ${
          completed ? "text-textMuted line-through" : "text-text"
        }`}
      >
        {task.title}
      </button>

      {task.assignedTo && <Avatar name={task.assignedTo.name} initials={task.assignedTo.avatar} size="sm" />}
    </div>
  );
}
