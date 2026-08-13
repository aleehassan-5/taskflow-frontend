import React, { useState } from "react";
import { Modal } from "./Modal";
import type { Hire, HireStatus, CompensationType } from "../types";
import { HIRE_STATUS_OPTIONS, HIRE_STATUS_META } from "./Badges";

export interface HireFormValues {
  name: string;
  email: string;
  phone: string;
  role: string;
  compensationType: CompensationType;
  compensationValue: string;
  status: HireStatus;
  source: string;
  notes: string;
  startDate: string;
}

export function HireFormModal({
  initial,
  onClose,
  onSubmit,
  submitting,
}: {
  initial?: Hire;
  onClose: () => void;
  onSubmit: (values: HireFormValues) => void;
  submitting: boolean;
}) {
  const [values, setValues] = useState<HireFormValues>({
    name: initial?.name || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    role: initial?.role || "",
    compensationType: initial?.compensationType || "SALARY",
    compensationValue: initial?.compensationValue != null ? String(initial.compensationValue) : "",
    status: initial?.status || "INTERVIEWING",
    source: initial?.source || "",
    notes: initial?.notes || "",
    startDate: initial?.startDate ? initial.startDate.slice(0, 10) : "",
  });
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof HireFormValues>(key: K, value: HireFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name.trim()) return setError("Name is required");
    if (!values.role.trim()) return setError("Role is required");
    if (
      values.compensationType === "PERCENTAGE" &&
      values.compensationValue &&
      Number(values.compensationValue) > 100
    ) {
      return setError("Percentage must be between 0 and 100");
    }
    setError(null);
    onSubmit(values);
  }

  const inputClass =
    "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-textMuted focus:border-primary";
  const labelClass = "mb-1.5 block text-xs font-medium text-textMuted";

  return (
    <Modal title={initial ? "Edit Hire" : "Add Hire"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Name</label>
          <input
            autoFocus
            className={inputClass}
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Hassan Raza"
          />
        </div>

        <div>
          <label className={labelClass}>Role / Position</label>
          <input
            className={inputClass}
            value={values.role}
            onChange={(e) => set("role", e.target.value)}
            placeholder="e.g. Frontend Developer"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              className={inputClass}
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              className={inputClass}
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+92 3xx xxxxxxx"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Compensation Type</label>
            <select
              className={inputClass}
              value={values.compensationType}
              onChange={(e) => set("compensationType", e.target.value as CompensationType)}
            >
              <option value="SALARY">Salary</option>
              <option value="PERCENTAGE">Percentage</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>
              {values.compensationType === "PERCENTAGE" ? "Percentage (%)" : "Salary Amount"}
            </label>
            <input
              type="number"
              min={0}
              max={values.compensationType === "PERCENTAGE" ? 100 : undefined}
              className={inputClass}
              value={values.compensationValue}
              onChange={(e) => set("compensationValue", e.target.value)}
              placeholder={values.compensationType === "PERCENTAGE" ? "e.g. 10" : "e.g. 80000"}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={values.status} onChange={(e) => set("status", e.target.value as HireStatus)}>
              {HIRE_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {HIRE_STATUS_META[s].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Start Date</label>
            <input
              type="date"
              className={inputClass}
              value={values.startDate}
              onChange={(e) => set("startDate", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Source</label>
          <input
            className={inputClass}
            value={values.source}
            onChange={(e) => set("source", e.target.value)}
            placeholder="e.g. Referral, LinkedIn, Upwork"
          />
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            className={inputClass}
            rows={3}
            value={values.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Interview notes, expectations, anything worth remembering"
          />
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
            {submitting ? "Saving..." : initial ? "Save Changes" : "Add Hire"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
