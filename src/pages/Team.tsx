import React, { useState } from "react";
import { Users } from "lucide-react";
import { useData } from "../context/DataContext";
import { Avatar, StatusBadge, PriorityBadge } from "../components/Badges";
import { EmptyState, SkeletonCard } from "../components/EmptyState";
import { formatDate } from "../lib/format";

export function Team() {
  const { users, tasks, loading, openTaskDetail } = useData();
  const [selected, setSelected] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return <EmptyState icon={Users} title="No team members yet" description="Invite teammates to get started." />;
  }

  const selectedUser = users.find((u) => u.id === selected);
  const selectedTasks = selectedUser ? tasks.filter((t) => t.assignedTo?.id === selectedUser.id) : [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {users.map((member) => (
          <button
            key={member.id}
            onClick={() => setSelected(selected === member.id ? null : member.id)}
            className={`rounded-lg border bg-surface p-4 text-left shadow-card transition-colors ${
              selected === member.id ? "border-primary" : "border-border hover:border-textMuted/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <Avatar name={member.name} initials={member.avatar} size="lg" />
              <div>
                <p className="text-sm font-semibold text-text">{member.name}</p>
                <p className="text-xs text-textMuted">{member.email}</p>
              </div>
              <span className="ml-auto rounded bg-surfaceHover px-2 py-0.5 text-xs font-medium text-textMuted">
                {member.role === "ADMIN" ? "Admin" : "Member"}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 border-t border-border pt-3 text-center">
              <div>
                <p className="text-sm font-semibold text-text">{member.stats.total}</p>
                <p className="text-[11px] text-textMuted">Total</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-text">{member.stats.pending}</p>
                <p className="text-[11px] text-textMuted">Pending</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-text">{member.stats.inProgress}</p>
                <p className="text-[11px] text-textMuted">Active</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-text">{member.stats.completed}</p>
                <p className="text-[11px] text-textMuted">Done</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedUser && (
        <div className="rounded-lg border border-border bg-surface shadow-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-text">{selectedUser.name}'s Tasks</h2>
          </div>
          {selectedTasks.length === 0 ? (
            <div className="p-4">
              <EmptyState icon={Users} title="No tasks assigned" description={`${selectedUser.name} has no assigned tasks yet.`} />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {selectedTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => openTaskDetail(task)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surfaceHover"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">{task.title}</p>
                  </div>
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                  <span className="w-20 shrink-0 text-right text-xs text-textMuted">{formatDate(task.dueDate)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
