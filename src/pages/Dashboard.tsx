import React, { useMemo } from "react";
import { ListTodo, Clock, Loader2, CheckCircle2, Inbox } from "lucide-react";
import { useData } from "../context/DataContext";
import { StatCard } from "../components/StatCard";
import { StatusBadge, PriorityBadge, Avatar } from "../components/Badges";
import { formatDate, timeAgo } from "../lib/format";
import { SkeletonCard } from "../components/EmptyState";
import { EmptyState } from "../components/EmptyState";
import type { TaskHistoryEntry, Task } from "../types";

export function Dashboard() {
  const { tasks, loading, openTaskDetail } = useData();

  const stats = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "PENDING").length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      completed: tasks.filter((t) => t.status === "COMPLETED").length,
    }),
    [tasks]
  );

  const recentTasks = useMemo(
    () => [...tasks].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6),
    [tasks]
  );

  const activity = useMemo(() => {
    const entries: { entry: TaskHistoryEntry; task: Task }[] = [];
    tasks.forEach((task) => task.history.forEach((entry) => entries.push({ entry, task })));
    return entries.sort((a, b) => +new Date(b.entry.createdAt) - +new Date(a.entry.createdAt)).slice(0, 8);
  }, [tasks]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Tasks" value={stats.total} icon={ListTodo} tone="primary" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} tone="default" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Loader2} tone="warning" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} tone="success" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface shadow-card lg:col-span-2">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-text">Recent Tasks</h2>
          </div>
          {recentTasks.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={Inbox}
                title="No tasks yet"
                description="Create your first task to see it show up here."
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => openTaskDetail(task)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surfaceHover"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">{task.title}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-textMuted">
                      {task.assignedTo ? (
                        <>
                          <Avatar name={task.assignedTo.name} initials={task.assignedTo.avatar} size="sm" />
                          {task.assignedTo.name}
                        </>
                      ) : (
                        "Unassigned"
                      )}
                    </div>
                  </div>
                  <div className="hidden shrink-0 items-center gap-2 sm:flex">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                  <span className="shrink-0 text-xs text-textMuted">{formatDate(task.dueDate)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface shadow-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-text">Team Activity</h2>
          </div>
          {activity.length === 0 ? (
            <div className="p-4">
              <EmptyState icon={Inbox} title="No activity yet" description="Actions on tasks will appear here." />
            </div>
          ) : (
            <div className="space-y-4 px-4 py-4">
              {activity.map(({ entry, task }) => (
                <div key={entry.id} className="flex gap-2.5">
                  <Avatar name={entry.by.name} initials={entry.by.avatar} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm text-text">
                      <span className="font-medium">{entry.by.name}</span>{" "}
                      <span className="text-textMuted">
                        {entry.action.replace(/^Task created by \S+/, "created")}
                      </span>{" "}
                      <span className="font-medium">{task.title}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-textMuted">{timeAgo(entry.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
