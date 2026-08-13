import React, { useState } from "react";
import { Modal } from "./Modal";
import type { PunishmentStatus, UserWithStats, Task } from "../types";
import { PUNISHMENT_STATUS_OPTIONS, PUNISHMENT_STATUS_META } from "./Badges";

export interface PunishmentFormValues {
  userId: string;
  reason: string;
  punishment: string;
  taskId: string;
  status: PunishmentStatus;
}

const FUNNY_SUGGESTIONS = [
  "Buys chai for the whole team ☕",
  "Does 20 push-ups on video call 💪",
  "Writes a public apology in the group chat 😔",
  "No lunch break until task is done 🍽️",
  "Has to wear a 'I missed a deadline' badge for a day 🏷️",
];

export function PunishmentFormModal({
  users,
  tasks,
  onClose,
  onSubmit,
  submitting,
}: {
  users: UserWithStats[];
  tasks: Task[];
  onClose: () => void;
  onSubmit: (values: PunishmentFormValues) => void;
  submitting: boolean;
}) {
  const [values, setValues] = useState<PunishmentFormValues>({
    userId: users[0]?.id || "",
    reason: "",
    punishment: "",
    taskId: "",
    status: "PENDING",
  });
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof PunishmentFormValues>(key: K, value: PunishmentFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.userId) return setError("Pick who this is for 😅");
    if (!values.reason.trim()) return setError("Reason is required");
    if (!values.punishment.trim()) return setError("Punishment is required");
    setError(null);
    onSubmit(values);
  }

  const inputClass =
    "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-textMuted focus:border-primary";
  const labelClass = "mb-1.5 block text-xs font-medium text-textMuted";

  return (
    <Modal title="Add Punishment 😅" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Who's in trouble?</label>
          <select className={inputClass} value={values.userId} onChange={(e) => set("userId", e.target.value)}>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Related Task (optional)</label>
          <select className={inputClass} value={values.taskId} onChange={(e) => set("taskId", e.target.value)}>
            <option value="">— None —</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Reason</label>
          <input
            autoFocus
            className={inputClass}
            value={values.reason}
            onChange={(e) => set("reason", e.target.value)}
            placeholder="e.g. Missed deadline on Landing Page"
          />
        </div>

        <div>
          <label className={labelClass}>Punishment</label>
          <input
            className={inputClass}
            value={values.punishment}
            onChange={(e) => set("punishment", e.target.value)}
            placeholder="e.g. Buys chai for the team"
            list="funny-suggestions"
          />
          <datalist id="funny-suggestions">
            {FUNNY_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} value={values.status} onChange={(e) => set("status", e.target.value as PunishmentStatus)}>
            {PUNISHMENT_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {PUNISHMENT_STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

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
            {submitting ? "Adding..." : "Add Punishment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
