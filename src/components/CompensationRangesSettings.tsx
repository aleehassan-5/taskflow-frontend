import React, { useEffect, useState } from "react";
import { Plus, Trash2, Percent } from "lucide-react";
import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { ConfirmDialog } from "./Modal";
import type { CompensationRange } from "../types";

function formatRangeLabel(min: number, max: number | null) {
  if (max == null) return `$${min}+`;
  return `$${min} - $${max}`;
}

export function CompensationRangesSettings() {
  const { showToast } = useToast();
  const [ranges, setRanges] = useState<CompensationRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<CompensationRange | null>(null);

  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [percentage, setPercentage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { ranges } = await api.compensationRanges.list();
      setRanges(ranges);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load ranges", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const min = Number(minValue);
    const max = maxValue.trim() === "" ? null : Number(maxValue);
    const pct = Number(percentage);

    if (minValue.trim() === "" || Number.isNaN(min) || min < 0) {
      return setError("Enter a valid minimum amount");
    }
    if (max != null && (Number.isNaN(max) || max < min)) {
      return setError("Max amount must be greater than or equal to min amount");
    }
    if (percentage.trim() === "" || Number.isNaN(pct) || pct < 0 || pct > 100) {
      return setError("Enter a valid percentage between 0 and 100");
    }
    setError(null);
    setSubmitting(true);
    try {
      const { range } = await api.compensationRanges.create({
        label: formatRangeLabel(min, max),
        minValue: min,
        maxValue: max,
        percentage: pct,
      });
      setRanges((list) => [...list, range].sort((a, b) => a.minValue - b.minValue));
      setMinValue("");
      setMaxValue("");
      setPercentage("");
      showToast("Range added");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to add range", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await api.compensationRanges.remove(deleting.id);
      setRanges((list) => list.filter((r) => r.id !== deleting.id));
      showToast("Range removed");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to remove range", "error");
    } finally {
      setDeleting(null);
    }
  }

  const inputClass =
    "w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-textMuted focus:border-primary";
  const labelClass = "mb-1.5 block text-xs font-medium text-textMuted";

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <h2 className="text-sm font-semibold text-text">Compensation ranges</h2>
      <p className="mt-1 text-sm text-textMuted">
        Define price ranges with a matching percentage. These show up as quick presets when adding a hire with
        percentage-based compensation.
      </p>

      {loading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-surfaceHover" />
          ))}
        </div>
      ) : ranges.length > 0 ? (
        <div className="mt-4 space-y-2">
          {ranges.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-md border border-border bg-bg px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Percent size={13} />
                </span>
                <div>
                  <p className="text-sm font-medium text-text">{r.label}</p>
                  <p className="text-xs text-textMuted">{r.percentage}%</p>
                </div>
              </div>
              <button
                onClick={() => setDeleting(r)}
                className="rounded p-1.5 text-textMuted hover:bg-danger/10 hover:text-danger"
                title="Remove range"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-textMuted">
          No ranges yet. Add your first one below.
        </p>
      )}

      <form onSubmit={handleAdd} className="mt-4 space-y-3 border-t border-border pt-4">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className={labelClass}>Min ($)</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              placeholder="400"
            />
          </div>
          <div>
            <label className={labelClass}>Max ($)</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              placeholder="500 (blank = and up)"
            />
          </div>
          <div>
            <label className={labelClass}>Percentage</label>
            <input
              type="number"
              min={0}
              max={100}
              className={inputClass}
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              placeholder="12"
            />
          </div>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primaryText hover:bg-primaryHover disabled:opacity-60"
        >
          <Plus size={15} /> {submitting ? "Adding..." : "Add range"}
        </button>
      </form>

      {deleting && (
        <ConfirmDialog
          title="Remove this range?"
          description={`"${deleting.label}" (${deleting.percentage}%) will no longer appear as a preset.`}
          confirmLabel="Remove"
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
