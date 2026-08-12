import React, { useState } from "react";
import { Modal } from "./Modal";
import type { Task, Status, Priority, UserWithStats } from "../types";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "./Badges";

const STATUS_LABEL: Record<Status, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};
const PRIORITY_LABEL: Record<Priority, string> = { LOW: "Low", MEDIUM: "Medium", HIGH: "High" };

export interface TaskFormValues {
  title: string;
  description: string;
  assignedToId: string;
  status: Status;
  priority: Priority;
  dueDate: string;
  tags: string;
}

export function TaskFormModal({
  users,
  initial,
  defaultDueDate,
  onClose,
  onSubmit,
  submitting,
}: {
  users: UserWithStats[];
  initial?: Task;
  defaultDueDate?: string;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
  submitting: boolean;
}) {
  const [values, setValues] = useState<TaskFormValues>({
    title: initial?.title || "",
    description: initial?.description || "",
    assignedToId: initial?.assignedTo?.id || "",
    status: initial?.status || "PENDING",
    priority: initial?.priority || "MEDIUM",
    dueDate: initial?.dueDate ? initial.dueDate.slice(0, 10) : defaultDueDate || "",
    tags: initial?.tags?.join(", ") || "",
  });
  const [errors, setErrors] = useState<string | null>(null);

  function set<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.title.trim()) {
      setErrors("Title is required");
      return;
    }
    setErrors(null);
    onSubmit(values);
  }

  const inputClass =
    "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-textMuted focus:border-primary";
  const labelClass = "mb-1.5 block text-xs font-medium text-textMuted";

  return (
    <Modal title={initial ? "Edit Task" : "Add Task"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Title</label>
          <input
            autoFocus
            className={inputClass}
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Redesign onboarding flow"
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            className={inputClass}
            rows={3}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Add details, context or acceptance criteria"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Assigned To</label>
            <select
              className={inputClass}
              value={values.assignedToId}
              onChange={(e) => set("assignedToId", e.target.value)}
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Due Date</label>
            <input
              type="date"
              className={inputClass}
              value={values.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={values.status} onChange={(e) => set("status", e.target.value as Status)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Priority</label>
            <select
              className={inputClass}
              value={values.priority}
              onChange={(e) => set("priority", e.target.value as Priority)}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Tags</label>
          <input
            className={inputClass}
            value={values.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="design, backend, urgent (comma separated)"
          />
        </div>

        {errors && <p className="text-sm text-danger">{errors}</p>}

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-3.5 py-2 text-sm font-medium text-text hover:bg-surfaceHover"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primaryText hover:bg-primaryHover disabled:opacity-60"
          >
            {submitting ? "Saving..." : initial ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
