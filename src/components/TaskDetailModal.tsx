import React, { useEffect, useState } from "react";
import { Modal } from "./Modal";
import type { Task, Status } from "../types";
import { StatusBadge, PriorityBadge, Avatar } from "./Badges";
import { formatDateTime } from "../lib/format";
import { Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { api } from "../lib/api";

export function TaskDetailModal({
  task,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Status) => void;
}) {
  // The list view only sends historyCount to keep things fast — fetch the full
  // history here, on demand, only when someone actually opens this task.
  const [history, setHistory] = useState<Task["history"]>(task.history);
  const [historyLoading, setHistoryLoading] = useState(!task.history);

  useEffect(() => {
    if (task.history) return;
    let cancelled = false;
    setHistoryLoading(true);
    api.tasks
      .get(task.id)
      .then(({ task: full }) => {
        if (!cancelled) setHistory(full.history);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id]);

  const infoRow = (label: string, value: React.ReactNode) => (
    <div>
      <p className="text-xs font-medium text-textMuted">{label}</p>
      <div className="mt-1 text-sm text-text">{value}</div>
    </div>
  );

  return (
    <Modal title="Task Details" onClose={onClose} width="max-w-2xl">
      <div className="space-y-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-text">{task.title}</h3>
            <div className="flex shrink-0 gap-1.5">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
          </div>
          {task.description && <p className="mt-2 text-sm leading-relaxed text-textMuted">{task.description}</p>}
          {task.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {task.tags.map((tag) => (
                <span key={tag} className="rounded bg-surfaceHover px-2 py-0.5 text-xs text-textMuted">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-md border border-border p-4 sm:grid-cols-3">
          {infoRow(
            "Assigned To",
            task.assignedTo ? (
              <div className="flex items-center gap-1.5">
                <Avatar name={task.assignedTo.name} initials={task.assignedTo.avatar} size="sm" />
                {task.assignedTo.name}
              </div>
            ) : (
              "Unassigned"
            )
          )}
          {infoRow("Due Date", formatDateTime(task.dueDate))}
          {infoRow("Created By", task.createdBy.name)}
          {infoRow("Created", formatDateTime(task.createdAt))}
          {infoRow("Completed By", task.completedBy?.name || "—")}
          {infoRow("Completed", task.completedAt ? formatDateTime(task.completedAt) : "—")}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-textMuted">Activity History</p>
          {historyLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 animate-pulse rounded-md bg-surfaceHover" />
              ))}
            </div>
          ) : (
            <div className="space-y-3 border-l border-border pl-4">
              {(history ?? []).map((h) => (
                <div key={h.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary" />
                  <p className="text-sm text-text">{h.action}</p>
                  <p className="text-xs text-textMuted">
                    {h.by.name} · {formatDateTime(h.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded-md border border-border px-3.5 py-2 text-sm font-medium text-danger hover:bg-danger/10"
          >
            <Trash2 size={14} /> Delete
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-md border border-border px-3.5 py-2 text-sm font-medium text-text hover:bg-surfaceHover"
          >
            <Edit2 size={14} /> Edit
          </button>
          {task.status !== "COMPLETED" && (
            <button
              onClick={() => onStatusChange("COMPLETED")}
              className="flex items-center gap-1.5 rounded-md bg-success px-3.5 py-2 text-sm font-medium text-white hover:bg-success/90"
            >
              <CheckCircle2 size={14} /> Mark Complete
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
