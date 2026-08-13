import React, { useEffect, useMemo, useState } from "react";
import { Siren, Plus, Trash2, Check, HeartHandshake } from "lucide-react";
import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { useData } from "../context/DataContext";
import { PunishmentFormModal, PunishmentFormValues } from "../components/PunishmentFormModal";
import { ConfirmDialog } from "../components/Modal";
import { PunishmentStatusBadge, PUNISHMENT_STATUS_OPTIONS, PUNISHMENT_STATUS_META } from "../components/Badges";
import { EmptyState } from "../components/EmptyState";
import { Avatar } from "../components/Badges";
import { timeAgo } from "../lib/format";
import type { Punishment, PunishmentStatus } from "../types";

export function Punishments() {
  const { showToast } = useToast();
  const { users, tasks } = useData();
  const [punishments, setPunishments] = useState<Punishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<PunishmentStatus | "ALL">("ALL");

  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<Punishment | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { punishments } = await api.punishments.list();
      setPunishments(punishments);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load punishments", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return punishments.filter((p) => {
      if (filterUser !== "ALL" && p.user.id !== filterUser) return false;
      if (filterStatus !== "ALL" && p.status !== filterStatus) return false;
      return true;
    });
  }, [punishments, filterUser, filterStatus]);

  async function handleSubmit(values: PunishmentFormValues) {
    setSubmitting(true);
    try {
      const { punishment } = await api.punishments.create({
        userId: values.userId,
        reason: values.reason.trim(),
        punishment: values.punishment.trim(),
        taskId: values.taskId || undefined,
        status: values.status,
      });
      setPunishments((list) => [punishment, ...list]);
      showToast("Punishment issued 😅");
      setFormOpen(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to add punishment", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(p: Punishment, status: PunishmentStatus) {
    try {
      const { punishment } = await api.punishments.update(p.id, { status });
      setPunishments((list) => list.map((x) => (x.id === punishment.id ? punishment : x)));
      showToast(status === "DONE" ? "Justice served ✅" : status === "FORGIVEN" ? "Forgiven 🙏" : "Marked pending");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to update", "error");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await api.punishments.remove(deleting.id);
      setPunishments((list) => list.filter((p) => p.id !== deleting.id));
      showToast("Punishment removed");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to remove", "error");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-text focus:border-primary"
          >
            <option value="ALL">Everyone</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as PunishmentStatus | "ALL")}
            className="rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-text focus:border-primary"
          >
            <option value="ALL">All statuses</option>
            {PUNISHMENT_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {PUNISHMENT_STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primaryText hover:bg-primaryHover"
        >
          <Plus size={15} /> Add Punishment
        </button>
      </div>

      {!loading && filtered.length === 0 ? (
        <EmptyState
          icon={Siren}
          title="No punishments yet 😇"
          description="Everyone's been finishing their tasks on time... for now."
          action={
            <button
              onClick={() => setFormOpen(true)}
              className="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primaryText hover:bg-primaryHover"
            >
              Issue the first one
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-36 animate-pulse rounded-lg bg-surfaceHover" />)
            : filtered.map((p) => (
                <div key={p.id} className="rounded-lg border border-border bg-surface p-4 shadow-card">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar name={p.user.name} initials={p.user.avatar} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-text">{p.user.name}</p>
                        {p.task && <p className="text-xs text-textMuted">re: {p.task.title}</p>}
                      </div>
                    </div>
                    <PunishmentStatusBadge status={p.status} />
                  </div>

                  <p className="mt-3 text-xs font-medium text-textMuted">Reason</p>
                  <p className="text-sm text-text">{p.reason}</p>

                  <p className="mt-2 text-xs font-medium text-textMuted">Punishment</p>
                  <p className="text-sm font-medium text-primary">{p.punishment}</p>

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <p className="text-xs text-textMuted">
                      Issued by {p.issuedBy.name} · {timeAgo(p.createdAt)}
                    </p>
                    <div className="flex items-center gap-1">
                      {p.status !== "DONE" && (
                        <button
                          onClick={() => updateStatus(p, "DONE")}
                          className="rounded p-1.5 text-textMuted hover:bg-success/10 hover:text-success"
                          title="Mark done"
                        >
                          <Check size={15} />
                        </button>
                      )}
                      {p.status === "PENDING" && (
                        <button
                          onClick={() => updateStatus(p, "FORGIVEN")}
                          className="rounded p-1.5 text-textMuted hover:bg-surfaceHover hover:text-text"
                          title="Forgive"
                        >
                          <HeartHandshake size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleting(p)}
                        className="rounded p-1.5 text-textMuted hover:bg-danger/10 hover:text-danger"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      )}

      {formOpen && (
        <PunishmentFormModal
          users={users}
          tasks={tasks}
          submitting={submitting}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Remove this punishment?"
          description={`This will delete "${deleting.punishment}" for ${deleting.user.name}.`}
          confirmLabel="Remove"
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
