import React, { useEffect, useRef, useState } from "react";
import { MoreVertical, Edit2, Trash2, CheckCircle2, Calendar, AlertCircle } from "lucide-react";
import type { Task, Status } from "../types";
import { StatusBadge, PriorityBadge, Avatar } from "./Badges";
import { formatDate, isOverdue, isDueSoon } from "../lib/format";

const STATUS_LABEL: Record<Status, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export function TaskCard({
  task,
  onOpen,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  task: Task;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Status) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const overdue = isOverdue(task.dueDate, task.status);
  const dueSoon = isDueSoon(task.dueDate, task.status);

  return (
    <div className="group rounded-lg border border-border bg-surface p-4 shadow-card transition-colors hover:border-textMuted/40">
      <div className="flex items-start justify-between gap-2">
        <button onClick={onOpen} className="min-w-0 flex-1 text-left">
          <h3 className="truncate text-sm font-semibold text-text">{task.title}</h3>
        </button>
        <div className="relative shrink-0" ref={ref}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded p-1 text-textMuted opacity-0 hover:bg-surfaceHover hover:text-text group-hover:opacity-100 focus:opacity-100"
            aria-label="Task actions"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-border bg-surface py-1 shadow-popover">
              <button
                onClick={() => {
                  onEdit();
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-text hover:bg-surfaceHover"
              >
                <Edit2 size={14} /> Edit
              </button>
              {task.status !== "COMPLETED" && (
                <button
                  onClick={() => {
                    onStatusChange("COMPLETED");
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-text hover:bg-surfaceHover"
                >
                  <CheckCircle2 size={14} /> Mark complete
                </button>
              )}
              <div className="my-1 border-t border-border" />
              {(["PENDING", "IN_PROGRESS", "COMPLETED"] as Status[])
                .filter((s) => s !== task.status)
                .map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      onStatusChange(s);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-textMuted hover:bg-surfaceHover hover:text-text"
                  >
                    Move to {STATUS_LABEL[s]}
                  </button>
                ))}
              <div className="my-1 border-t border-border" />
              <button
                onClick={() => {
                  onDelete();
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-danger hover:bg-danger/10"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-sm text-textMuted">{task.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
        {task.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="rounded bg-surfaceHover px-2 py-0.5 text-xs text-textMuted">
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-3.5 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1.5" title={task.assignedTo?.name || "Unassigned"}>
          {task.assignedTo ? (
            <>
              <Avatar name={task.assignedTo.name} initials={task.assignedTo.avatar} size="sm" />
              <span className="text-xs text-textMuted">{task.assignedTo.name}</span>
            </>
          ) : (
            <span className="text-xs text-textMuted">Unassigned</span>
          )}
        </div>
        {task.dueDate && (
          <div
            className={`flex items-center gap-1 text-xs ${
              overdue ? "text-danger" : dueSoon ? "text-warning" : "text-textMuted"
            }`}
          >
            {overdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
            {formatDate(task.dueDate)}
          </div>
        )}
      </div>

      {task.status === "COMPLETED" && task.completedBy && (
        <p className="mt-2 text-xs text-success">Completed by {task.completedBy.name}</p>
      )}
    </div>
  );
}
