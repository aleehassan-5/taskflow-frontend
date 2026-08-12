import React, { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ArrowUpDown, Edit2, Trash2, CheckCircle2, ClipboardList } from "lucide-react";
import { useData } from "../context/DataContext";
import { FilterBar } from "../components/FilterBar";
import { StatusBadge, PriorityBadge, Avatar } from "../components/Badges";
import { TaskCard } from "../components/TaskCard";
import { EmptyState, SkeletonRow } from "../components/EmptyState";
import { formatDate, isOverdue } from "../lib/format";
import type { Status, Priority, Task } from "../types";

type SortKey = "title" | "priority" | "status" | "dueDate";
const PRIORITY_RANK: Record<Priority, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };

export function AllTasks() {
  const { search } = useOutletContext<{ search: string }>();
  const { tasks, loading, openTaskDetail, openEditTask, requestDeleteTask, changeStatus } = useData();
  const [status, setStatus] = useState<Status | "ALL">("ALL");
  const [priority, setPriority] = useState<Priority | "ALL">("ALL");
  const [due, setDue] = useState<"ALL" | "OVERDUE" | "WEEK">("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(key);
      setSortDir(1);
    }
  }

  const filtered = useMemo(() => {
    let list = tasks.filter((t) => {
      if (status !== "ALL" && t.status !== status) return false;
      if (priority !== "ALL" && t.priority !== priority) return false;
      if (due === "OVERDUE" && !isOverdue(t.dueDate, t.status)) return false;
      if (due === "WEEK") {
        if (!t.dueDate) return false;
        const diff = new Date(t.dueDate).getTime() - Date.now();
        if (diff < 0 || diff > 7 * 24 * 60 * 60 * 1000) return false;
      }
      if (search && !`${t.title} ${t.description ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "priority") cmp = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else if (sortKey === "dueDate") cmp = (a.dueDate ? +new Date(a.dueDate) : Infinity) - (b.dueDate ? +new Date(b.dueDate) : Infinity);
      return cmp * sortDir;
    });
    return list;
  }, [tasks, status, priority, due, search, sortKey, sortDir]);

  const SortHeader = ({ label, sortField }: { label: string; sortField: SortKey }) => (
    <button
      onClick={() => toggleSort(sortField)}
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-textMuted hover:text-text"
    >
      {label}
      <ArrowUpDown size={12} className={sortKey === sortField ? "text-primary" : ""} />
    </button>
  );

  return (
    <div className="space-y-4">
      <FilterBar
        status={status}
        onStatusChange={setStatus}
        priority={priority}
        onPriorityChange={setPriority}
        due={due}
        onDueChange={setDue}
      />

      {!loading && filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No tasks found" description="Try adjusting your filters or search." />
      ) : (
        <>
          {/* Table - desktop */}
          <div className="hidden overflow-hidden rounded-lg border border-border bg-surface shadow-card md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surfaceHover/60">
                  <th className="px-4 py-2.5 text-left"><SortHeader label="Task" sortField="title" /></th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-textMuted">
                    Assigned To
                  </th>
                  <th className="px-4 py-2.5 text-left"><SortHeader label="Priority" sortField="priority" /></th>
                  <th className="px-4 py-2.5 text-left"><SortHeader label="Status" sortField="status" /></th>
                  <th className="px-4 py-2.5 text-left"><SortHeader label="Due Date" sortField="dueDate" /></th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-textMuted">
                    Created By
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-textMuted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : filtered.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onOpen={() => openTaskDetail(task)}
                        onEdit={() => openEditTask(task)}
                        onDelete={() => requestDeleteTask(task)}
                        onComplete={() => changeStatus(task, "COMPLETED")}
                      />
                    ))}
              </tbody>
            </table>
          </div>

          {/* Cards - mobile */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-lg bg-surfaceHover" />)
              : filtered.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onOpen={() => openTaskDetail(task)}
                    onEdit={() => openEditTask(task)}
                    onDelete={() => requestDeleteTask(task)}
                    onStatusChange={(s) => changeStatus(task, s)}
                  />
                ))}
          </div>
        </>
      )}
    </div>
  );
}

function TaskRow({
  task,
  onOpen,
  onEdit,
  onDelete,
  onComplete,
}: {
  task: Task;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
}) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-surfaceHover/60">
      <td className="max-w-[220px] px-4 py-3">
        <button onClick={onOpen} className="truncate text-left text-sm font-medium text-text hover:text-primary">
          {task.title}
        </button>
      </td>
      <td className="px-4 py-3">
        {task.assignedTo ? (
          <div className="flex items-center gap-1.5 text-sm text-text">
            <Avatar name={task.assignedTo.name} initials={task.assignedTo.avatar} size="sm" />
            {task.assignedTo.name}
          </div>
        ) : (
          <span className="text-sm text-textMuted">Unassigned</span>
        )}
      </td>
      <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
      <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
      <td className={`px-4 py-3 text-sm ${isOverdue(task.dueDate, task.status) ? "text-danger" : "text-textMuted"}`}>
        {formatDate(task.dueDate)}
      </td>
      <td className="px-4 py-3 text-sm text-textMuted">{task.createdBy.name}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          {task.status !== "COMPLETED" && (
            <button
              onClick={onComplete}
              className="rounded p-1.5 text-textMuted hover:bg-success/10 hover:text-success"
              title="Mark complete"
            >
              <CheckCircle2 size={15} />
            </button>
          )}
          <button onClick={onEdit} className="rounded p-1.5 text-textMuted hover:bg-surfaceHover hover:text-text" title="Edit">
            <Edit2 size={15} />
          </button>
          <button onClick={onDelete} className="rounded p-1.5 text-textMuted hover:bg-danger/10 hover:text-danger" title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}
