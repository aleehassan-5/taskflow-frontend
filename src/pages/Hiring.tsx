import React, { useEffect, useMemo, useState } from "react";
import { Briefcase, Plus, Edit2, Trash2, Search, Mail, Phone } from "lucide-react";
import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { HireFormModal, HireFormValues } from "../components/HireFormModal";
import { ConfirmDialog } from "../components/Modal";
import { HireStatusBadge, HIRE_STATUS_OPTIONS, HIRE_STATUS_META } from "../components/Badges";
import { EmptyState, SkeletonRow } from "../components/EmptyState";
import { formatDate, formatCompensation } from "../lib/format";
import type { Hire, HireStatus } from "../types";

export function Hiring() {
  const { showToast } = useToast();
  const [hires, setHires] = useState<Hire[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<HireStatus | "ALL">("ALL");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Hire | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<Hire | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { hires } = await api.hires.list();
      setHires(hires);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load hires", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return hires.filter((h) => {
      if (status !== "ALL" && h.status !== status) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!`${h.name} ${h.role} ${h.email ?? ""}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [hires, search, status]);

  function openAdd() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(hire: Hire) {
    setEditing(hire);
    setFormOpen(true);
  }

  async function handleSubmit(values: HireFormValues) {
    setSubmitting(true);
    const payload = {
      name: values.name.trim(),
      email: values.email.trim() || undefined,
      phone: values.phone.trim() || undefined,
      role: values.role.trim(),
      compensationType: values.compensationType,
      compensationValue: values.compensationValue ? Number(values.compensationValue) : undefined,
      status: values.status,
      source: values.source.trim() || undefined,
      notes: values.notes.trim() || undefined,
      startDate: values.startDate || undefined,
    };
    try {
      if (editing) {
        const { hire } = await api.hires.update(editing.id, payload);
        setHires((list) => list.map((h) => (h.id === hire.id ? hire : h)));
        showToast("Hire updated");
      } else {
        const { hire } = await api.hires.create(payload);
        setHires((list) => [hire, ...list]);
        showToast("Hire added");
      }
      setFormOpen(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to save hire", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await api.hires.remove(deleting.id);
      setHires((list) => list.filter((h) => h.id !== deleting.id));
      showToast("Hire removed");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to remove hire", "error");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative max-w-xs flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, role, email..."
              className="w-full rounded-md border border-border bg-bg py-1.5 pl-8 pr-3 text-sm text-text placeholder:text-textMuted focus:border-primary"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as HireStatus | "ALL")}
            className="rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-text focus:border-primary"
          >
            <option value="ALL">All statuses</option>
            {HIRE_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {HIRE_STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={openAdd}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primaryText hover:bg-primaryHover"
        >
          <Plus size={15} /> Add Hire
        </button>
      </div>

      {!loading && filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No hires yet"
          description="Track candidates you're interviewing or bringing on board."
          action={
            <button
              onClick={openAdd}
              className="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primaryText hover:bg-primaryHover"
            >
              Add your first hire
            </button>
          }
        />
      ) : (
        <>
          {/* Table - desktop */}
          <div className="hidden overflow-hidden rounded-lg border border-border bg-surface shadow-card md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surfaceHover/60">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-textMuted">Name</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-textMuted">Role</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-textMuted">Contact</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-textMuted">Compensation</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-textMuted">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-textMuted">Start Date</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-textMuted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                  : filtered.map((hire) => (
                      <tr key={hire.id} className="border-b border-border last:border-0 hover:bg-surfaceHover/60">
                        <td className="px-4 py-3 text-sm font-medium text-text">{hire.name}</td>
                        <td className="px-4 py-3 text-sm text-textMuted">{hire.role}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5 text-xs text-textMuted">
                            {hire.email && (
                              <span className="flex items-center gap-1">
                                <Mail size={11} /> {hire.email}
                              </span>
                            )}
                            {hire.phone && (
                              <span className="flex items-center gap-1">
                                <Phone size={11} /> {hire.phone}
                              </span>
                            )}
                            {!hire.email && !hire.phone && "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-text">
                          {formatCompensation(hire.compensationType, hire.compensationValue)}
                        </td>
                        <td className="px-4 py-3">
                          <HireStatusBadge status={hire.status} />
                        </td>
                        <td className="px-4 py-3 text-sm text-textMuted">{formatDate(hire.startDate)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(hire)}
                              className="rounded p-1.5 text-textMuted hover:bg-surfaceHover hover:text-text"
                              title="Edit"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => setDeleting(hire)}
                              className="rounded p-1.5 text-textMuted hover:bg-danger/10 hover:text-danger"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Cards - mobile */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-lg bg-surfaceHover" />)
              : filtered.map((hire) => (
                  <div key={hire.id} className="rounded-lg border border-border bg-surface p-4 shadow-card">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-text">{hire.name}</p>
                        <p className="text-xs text-textMuted">{hire.role}</p>
                      </div>
                      <HireStatusBadge status={hire.status} />
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-textMuted">
                      {hire.email && (
                        <p className="flex items-center gap-1">
                          <Mail size={11} /> {hire.email}
                        </p>
                      )}
                      {hire.phone && (
                        <p className="flex items-center gap-1">
                          <Phone size={11} /> {hire.phone}
                        </p>
                      )}
                      <p>{formatCompensation(hire.compensationType, hire.compensationValue)}</p>
                      {hire.startDate && <p>Starts {formatDate(hire.startDate)}</p>}
                    </div>
                    <div className="mt-3 flex justify-end gap-1 border-t border-border pt-2">
                      <button
                        onClick={() => openEdit(hire)}
                        className="rounded p-1.5 text-textMuted hover:bg-surfaceHover hover:text-text"
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleting(hire)}
                        className="rounded p-1.5 text-textMuted hover:bg-danger/10 hover:text-danger"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        </>
      )}

      {formOpen && (
        <HireFormModal
          initial={editing}
          submitting={submitting}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Remove this hire?"
          description={`This will permanently remove ${deleting.name} from your hiring tracker.`}
          confirmLabel="Remove"
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
