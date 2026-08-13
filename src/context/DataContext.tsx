import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Task, UserWithStats, Notification, Status } from "../types";
import { api } from "../lib/api";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";
import { TaskFormModal, TaskFormValues } from "../components/TaskFormModal";
import { TaskDetailModal } from "../components/TaskDetailModal";
import { ConfirmDialog } from "../components/Modal";

interface DataContextValue {
  tasks: Task[];
  users: UserWithStats[];
  notifications: Notification[];
  loading: boolean;
  refreshTasks: () => Promise<void>;
  refreshAll: () => Promise<void>;
  openAddTask: (defaultDueDate?: string) => void;
  openEditTask: (task: Task) => void;
  openTaskDetail: (task: Task) => void;
  requestDeleteTask: (task: Task) => void;
  changeStatus: (task: Task, status: Status) => Promise<void>;
  moveTaskDate: (task: Task, dueDate: string) => Promise<void>;
  markNotificationRead: (n: Notification) => void;
  markAllNotificationsRead: () => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [addDefaultDueDate, setAddDefaultDueDate] = useState<string | undefined>(undefined);
  const [editTarget, setEditTarget] = useState<Task | null>(null);
  const [detailTarget, setDetailTarget] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refreshTasks = useCallback(async () => {
    const { tasks } = await api.tasks.list();
    setTasks(tasks);
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [{ tasks }, { users }, { notifications }] = await Promise.all([
        api.tasks.list(),
        api.users.list(),
        api.notifications.list(),
      ]);
      setTasks(tasks);
      setUsers(users);
      setNotifications(notifications);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) refreshAll();
  }, [user, refreshAll]);

  function openAddTask(defaultDueDate?: string) {
    setAddDefaultDueDate(defaultDueDate);
    setAddOpen(true);
  }
  function openEditTask(task: Task) {
    setEditTarget(task);
    setDetailTarget(null);
  }
  function openTaskDetail(task: Task) {
    setDetailTarget(task);
  }
  function requestDeleteTask(task: Task) {
    setDeleteTarget(task);
    setDetailTarget(null);
  }

  async function handleCreate(values: TaskFormValues) {
    setSubmitting(true);
    try {
      const { task } = await api.tasks.create({
        title: values.title,
        description: values.description || undefined,
        assignedToId: values.assignedToId || undefined,
        status: values.status,
        priority: values.priority,
        dueDate: values.dueDate || undefined,
        tags: values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setTasks((prev) => [task, ...prev]);
      // Task counts on the Team page depend on this, but nothing on screen right
      // now is blocked by it, so don't make the user wait for it.
      api.users.list().then(({ users }) => setUsers(users)).catch(() => {});
      showToast("Task created successfully");
      setAddOpen(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to create task", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(values: TaskFormValues) {
    if (!editTarget) return;
    setSubmitting(true);
    try {
      const { task } = await api.tasks.update(editTarget.id, {
        title: values.title,
        description: values.description || undefined,
        assignedToId: values.assignedToId || null,
        priority: values.priority,
        dueDate: values.dueDate || null,
        tags: values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      let finalTask = task;
      if (values.status !== editTarget.status) {
        finalTask = (await api.tasks.setStatus(editTarget.id, values.status)).task;
      }
      setTasks((prev) => prev.map((t) => (t.id === finalTask.id ? finalTask : t)));
      if (values.status !== editTarget.status || values.assignedToId !== (editTarget.assignedTo?.id || "")) {
        api.users.list().then(({ users }) => setUsers(users)).catch(() => {});
      }
      showToast("Task updated successfully");
      setEditTarget(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to update task", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function changeStatus(task: Task, status: Status) {
    // Feels instant; rolled back below if the request fails.
    const prevTasks = tasks;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
    try {
      const { task: updated } = await api.tasks.setStatus(task.id, status);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      api.users.list().then(({ users }) => setUsers(users)).catch(() => {});
      showToast(status === "COMPLETED" ? "Task marked as completed" : "Task status updated");
    } catch (e) {
      setTasks(prevTasks);
      showToast(e instanceof Error ? e.message : "Failed to update status", "error");
    }
  }

  async function moveTaskDate(task: Task, dueDate: string) {
    // Optimistically move the task locally so the calendar feels instant.
    const prevTasks = tasks;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, dueDate } : t)));
    try {
      const { task: updated } = await api.tasks.update(task.id, { dueDate });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      showToast("Task rescheduled");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to reschedule task", "error");
      setTasks(prevTasks);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    try {
      await api.tasks.remove(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      api.users.list().then(({ users }) => setUsers(users)).catch(() => {});
      showToast("Task deleted");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to delete task", "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  async function markNotificationRead(n: Notification) {
    if (!n.read) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      api.notifications.markRead(n.id).catch(() => {});
    }
    if (n.taskId) {
      const task = tasks.find((t) => t.id === n.taskId);
      if (task) setDetailTarget(task);
    }
  }

  async function markAllNotificationsRead() {
    setNotifications((prev) => prev.map((x) => ({ ...x, read: true })));
    api.notifications.markAllRead().catch(() => {});
  }

  return (
    <DataContext.Provider
      value={{
        tasks,
        users,
        notifications,
        loading,
        refreshTasks,
        refreshAll,
        openAddTask,
        openEditTask,
        openTaskDetail,
        requestDeleteTask,
        changeStatus,
        moveTaskDate,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}

      {addOpen && (
        <TaskFormModal
          users={users}
          defaultDueDate={addDefaultDueDate}
          onClose={() => setAddOpen(false)}
          onSubmit={handleCreate}
          submitting={submitting}
        />
      )}

      {editTarget && (
        <TaskFormModal
          users={users}
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={handleUpdate}
          submitting={submitting}
        />
      )}

      {detailTarget && (
        <TaskDetailModal
          task={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={() => openEditTask(detailTarget)}
          onDelete={() => requestDeleteTask(detailTarget)}
          onStatusChange={(status) => {
            changeStatus(detailTarget, status);
            setDetailTarget(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this task?"
          description={`"${deleteTarget.title}" will be permanently removed. This can't be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
