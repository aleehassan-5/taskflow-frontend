import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import type { Priority, Task } from "../types";
import { CalendarTaskItem } from "../components/CalendarTaskItem";
import { isOverdue } from "../lib/format";
import {
  addDays,
  addMonths,
  addWeeks,
  formatDayHeader,
  formatMonthYear,
  getMonthMatrix,
  getWeekDays,
  isToday,
  toDateKey,
} from "../lib/calendar";

type ViewMode = "month" | "week" | "day";
type QuickFilter = "ALL" | "MINE" | "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";

const QUICK_FILTERS: { value: QuickFilter; label: string }[] = [
  { value: "ALL", label: "All Tasks" },
  { value: "MINE", label: "My Tasks" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "OVERDUE", label: "Overdue" },
];

const PRIORITY_RANK: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export function Calendar() {
  const { tasks, users, loading, openAddTask, openTaskDetail, changeStatus, moveTaskDate } = useData();
  const { user } = useAuth();

  const [view, setView] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState(new Date());
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "ALL">("ALL");
  const [memberFilter, setMemberFilter] = useState<string>("ALL");
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (quickFilter === "MINE" && t.assignedTo?.id !== user?.id) return false;
      if (quickFilter === "PENDING" && t.status !== "PENDING") return false;
      if (quickFilter === "IN_PROGRESS" && t.status !== "IN_PROGRESS") return false;
      if (quickFilter === "COMPLETED" && t.status !== "COMPLETED") return false;
      if (quickFilter === "OVERDUE" && !isOverdue(t.dueDate, t.status)) return false;
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
      if (memberFilter !== "ALL" && t.assignedTo?.id !== memberFilter) return false;
      return true;
    });
  }, [tasks, quickFilter, priorityFilter, memberFilter, user]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of filteredTasks) {
      if (!t.dueDate) continue;
      const key = toDateKey(new Date(t.dueDate));
      const arr = map.get(key) || [];
      arr.push(t);
      map.set(key, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    }
    return map;
  }, [filteredTasks]);

  function goPrev() {
    if (view === "month") setCursor((d) => addMonths(d, -1));
    else if (view === "week") setCursor((d) => addWeeks(d, -1));
    else setCursor((d) => addDays(d, -1));
  }
  function goNext() {
    if (view === "month") setCursor((d) => addMonths(d, 1));
    else if (view === "week") setCursor((d) => addWeeks(d, 1));
    else setCursor((d) => addDays(d, 1));
  }
  function goToday() {
    setCursor(new Date());
  }

  function handleToggle(task: Task) {
    changeStatus(task, task.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED");
  }

  function handleDrop(dateKey: string) {
    if (!dragTaskId) return;
    const task = tasks.find((t) => t.id === dragTaskId);
    setDragTaskId(null);
    if (!task) return;
    if (task.dueDate && toDateKey(new Date(task.dueDate)) === dateKey) return;
    moveTaskDate(task, dateKey);
  }

  const headerLabel =
    view === "month"
      ? formatMonthYear(cursor)
      : view === "week"
      ? (() => {
          const days = getWeekDays(cursor);
          const sameMonth = days[0].getMonth() === days[6].getMonth();
          return sameMonth
            ? `${formatMonthYear(days[0])} · ${days[0].getDate()}–${days[6].getDate()}`
            : `${days[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${days[6].toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" }
              )}`;
        })()
      : formatDayHeader(cursor, true);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={goPrev}
            className="rounded-md border border-border p-1.5 text-textMuted hover:bg-surfaceHover hover:text-text"
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goNext}
            className="rounded-md border border-border p-1.5 text-textMuted hover:bg-surfaceHover hover:text-text"
            aria-label="Next"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={goToday}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surfaceHover"
          >
            Today
          </button>
          <h2 className="ml-1 text-[15px] font-semibold text-text">{headerLabel}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-md border border-border bg-surface p-1">
            {(["month", "week", "day"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  view === v ? "bg-primary text-primaryText" : "text-textMuted hover:bg-surfaceHover"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={() => openAddTask(toDateKey(cursor))}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primaryText hover:bg-primaryHover"
          >
            <Plus size={15} /> Add Task
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-md border border-border bg-surface p-1">
          {QUICK_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setQuickFilter(f.value)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                quickFilter === f.value ? "bg-primary text-primaryText" : "text-textMuted hover:bg-surfaceHover"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-text focus:border-primary"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as Priority | "ALL")}
        >
          <option value="ALL">All priorities</option>
          <option value="LOW">Low priority</option>
          <option value="MEDIUM">Medium priority</option>
          <option value="HIGH">High priority</option>
        </select>

        <select
          className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-text focus:border-primary"
          value={memberFilter}
          onChange={(e) => setMemberFilter(e.target.value)}
        >
          <option value="ALL">All team members</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="h-96 animate-pulse rounded-lg bg-surfaceHover" />
      ) : view === "month" ? (
        <MonthGrid
          cursor={cursor}
          tasksByDate={tasksByDate}
          onDateClick={(key) => openAddTask(key)}
          onTaskOpen={openTaskDetail}
          onTaskToggle={handleToggle}
          onDragStart={setDragTaskId}
          onDrop={handleDrop}
        />
      ) : (
        <AgendaView
          days={view === "week" ? getWeekDays(cursor) : [cursor]}
          tasksByDate={tasksByDate}
          onDateClick={(key) => openAddTask(key)}
          onTaskOpen={openTaskDetail}
          onTaskToggle={handleToggle}
          onDragStart={setDragTaskId}
          onDrop={handleDrop}
          large={view === "day"}
        />
      )}
    </div>
  );
}

function MonthGrid({
  cursor,
  tasksByDate,
  onDateClick,
  onTaskOpen,
  onTaskToggle,
  onDragStart,
  onDrop,
}: {
  cursor: Date;
  tasksByDate: Map<string, Task[]>;
  onDateClick: (key: string) => void;
  onTaskOpen: (task: Task) => void;
  onTaskToggle: (task: Task) => void;
  onDragStart: (taskId: string) => void;
  onDrop: (key: string) => void;
}) {
  const weeks = getMonthMatrix(cursor);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const VISIBLE_LIMIT = 3;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <div className="grid grid-cols-7 border-b border-border bg-surfaceHover/60">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-textMuted">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {weeks.flat().map((date) => {
          const key = toDateKey(date);
          const dayTasks = tasksByDate.get(key) || [];
          const inMonth = date.getMonth() === cursor.getMonth();
          const today = isToday(date);
          const expanded = expandedKey === key;
          const visibleTasks = expanded ? dayTasks : dayTasks.slice(0, VISIBLE_LIMIT);
          const hiddenCount = dayTasks.length - VISIBLE_LIMIT;

          return (
            <div
              key={key}
              onClick={() => onDateClick(key)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverKey(key);
              }}
              onDragLeave={() => setDragOverKey((k) => (k === key ? null : k))}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverKey(null);
                onDrop(key);
              }}
              className={`group flex min-h-[104px] cursor-pointer flex-col gap-0.5 border-b border-r border-border p-1.5 transition-colors last:border-r-0 hover:bg-surfaceHover/40 ${
                !inMonth ? "bg-bg/60" : ""
              } ${dragOverKey === key ? "bg-primary/10" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium ${
                    today ? "bg-primary text-primaryText" : inMonth ? "text-text" : "text-textMuted/50"
                  }`}
                >
                  {date.getDate()}
                </span>
                <Plus size={12} className="text-textMuted opacity-0 transition-opacity group-hover:opacity-100" />
              </div>

              <div className="flex-1 space-y-0.5">
                {visibleTasks.map((t) => (
                  <CalendarTaskItem key={t.id} task={t} onOpen={onTaskOpen} onToggle={onTaskToggle} onDragStart={onDragStart} />
                ))}
                {!expanded && hiddenCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedKey(key);
                    }}
                    className="px-1 text-[11px] font-medium text-primary hover:underline"
                  >
                    +{hiddenCount} more
                  </button>
                )}
                {expanded && dayTasks.length > VISIBLE_LIMIT && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedKey(null);
                    }}
                    className="px-1 text-[11px] font-medium text-textMuted hover:underline"
                  >
                    Show less
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgendaView({
  days,
  tasksByDate,
  onDateClick,
  onTaskOpen,
  onTaskToggle,
  onDragStart,
  onDrop,
  large,
}: {
  days: Date[];
  tasksByDate: Map<string, Task[]>;
  onDateClick: (key: string) => void;
  onTaskOpen: (task: Task) => void;
  onTaskToggle: (task: Task) => void;
  onDragStart: (taskId: string) => void;
  onDrop: (key: string) => void;
  large?: boolean;
}) {
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  return (
    <div className={`grid gap-3 ${large ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-7"}`}>
      {days.map((date) => {
        const key = toDateKey(date);
        const dayTasks = tasksByDate.get(key) || [];
        const today = isToday(date);

        return (
          <div
            key={key}
            onClick={() => onDateClick(key)}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverKey(key);
            }}
            onDragLeave={() => setDragOverKey((k) => (k === key ? null : k))}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverKey(null);
              onDrop(key);
            }}
            className={`flex cursor-pointer flex-col rounded-lg border border-border bg-surface p-3 shadow-card transition-colors hover:border-textMuted/40 ${
              large ? "min-h-[420px]" : "min-h-[180px]"
            } ${dragOverKey === key ? "bg-primary/10" : ""}`}
          >
            <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
              <div>
                <p className="text-xs font-medium text-textMuted">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </p>
                <p className={`text-sm font-semibold ${today ? "text-primary" : "text-text"}`}>
                  {date.toLocaleDateString("en-US", { day: "2-digit", month: "short" })}
                </p>
              </div>
              <Plus size={14} className="text-textMuted" />
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto">
              {dayTasks.length === 0 ? (
                <p className="pt-4 text-center text-xs text-textMuted">No tasks</p>
              ) : (
                dayTasks.map((t) => (
                  <CalendarTaskItem key={t.id} task={t} onOpen={onTaskOpen} onToggle={onTaskToggle} onDragStart={onDragStart} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
