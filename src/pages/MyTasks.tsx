import React, { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ListChecks } from "lucide-react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { TaskCard } from "../components/TaskCard";
import { FilterBar } from "../components/FilterBar";
import { EmptyState, SkeletonCard } from "../components/EmptyState";
import type { Status, Priority } from "../types";
import { isOverdue } from "../lib/format";

export function MyTasks() {
  const { search } = useOutletContext<{ search: string }>();
  const { tasks, loading, openTaskDetail, openEditTask, requestDeleteTask, changeStatus } = useData();
  const { user } = useAuth();
  const [status, setStatus] = useState<Status | "ALL">("ALL");
  const [priority, setPriority] = useState<Priority | "ALL">("ALL");
  const [due, setDue] = useState<"ALL" | "OVERDUE" | "WEEK">("ALL");

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (t.assignedTo?.id !== user?.id) return false;
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
  }, [tasks, user, status, priority, due, search]);

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

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No tasks match these filters"
          description="Try adjusting your filters, or create a new task assigned to you."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((task) => (
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
      )}
    </div>
  );
}
