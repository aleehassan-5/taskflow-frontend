import React, { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useData } from "../context/DataContext";
import { TaskCard } from "../components/TaskCard";
import { EmptyState, SkeletonCard } from "../components/EmptyState";

export function Completed() {
  const { search } = useOutletContext<{ search: string }>();
  const { tasks, loading, openTaskDetail, openEditTask, requestDeleteTask, changeStatus } = useData();
  const [memberFilter, setMemberFilter] = useState<string>("ALL");

  const completedTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status === "COMPLETED")
      .filter((t) => memberFilter === "ALL" || t.completedBy?.id === memberFilter)
      .filter((t) => !search || `${t.title} ${t.description ?? ""}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => +new Date(b.completedAt || b.updatedAt) - +new Date(a.completedAt || a.updatedAt));
  }, [tasks, memberFilter, search]);

  const completers = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((t) => {
      if (t.completedBy) map.set(t.completedBy.id, t.completedBy.name);
    });
    return Array.from(map.entries());
  }, [tasks]);

  return (
    <div className="space-y-4">
      {completers.length > 0 && (
        <div className="flex flex-wrap gap-1 rounded-md border border-border bg-surface p-1 w-fit">
          <button
            onClick={() => setMemberFilter("ALL")}
            className={`rounded px-2.5 py-1 text-xs font-medium ${
              memberFilter === "ALL" ? "bg-primary text-primaryText" : "text-textMuted hover:bg-surfaceHover"
            }`}
          >
            Everyone
          </button>
          {completers.map(([id, name]) => (
            <button
              key={id}
              onClick={() => setMemberFilter(id)}
              className={`rounded px-2.5 py-1 text-xs font-medium ${
                memberFilter === id ? "bg-primary text-primaryText" : "text-textMuted hover:bg-surfaceHover"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : completedTasks.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Nothing completed yet"
          description="Tasks marked as completed will show up here with who finished them and when."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {completedTasks.map((task) => (
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
