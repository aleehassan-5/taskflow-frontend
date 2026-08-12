import React, { useState, useRef, useEffect } from "react";
import { Menu, Search, Bell, Sun, Moon, Plus } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./Badges";
import type { Notification } from "../types";
import { timeAgo } from "../lib/format";

export function Topbar({
  title,
  onMenuClick,
  search,
  onSearchChange,
  notifications,
  onNotificationClick,
  onMarkAllRead,
  onAddTask,
}: {
  title: string;
  onMenuClick: () => void;
  search: string;
  onSearchChange: (v: string) => void;
  notifications: Notification[];
  onNotificationClick: (n: Notification) => void;
  onMarkAllRead: () => void;
  onAddTask: () => void;
}) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-surface px-4 md:px-6">
      <button className="text-textMuted hover:text-text md:hidden" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={20} />
      </button>

      <h1 className="hidden shrink-0 text-[15px] font-semibold text-text md:block">{title}</h1>

      <div className="relative ml-auto max-w-sm flex-1 md:ml-6">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="w-full rounded-md border border-border bg-bg py-1.5 pl-8 pr-3 text-sm text-text placeholder:text-textMuted focus:border-primary"
        />
      </div>

      <button
        onClick={onAddTask}
        className="hidden shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primaryText hover:bg-primaryHover sm:flex"
      >
        <Plus size={15} /> Add Task
      </button>

      <div className="relative shrink-0" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="relative rounded-md p-2 text-textMuted hover:bg-surfaceHover hover:text-text"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
          )}
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-2 w-80 rounded-md border border-border bg-surface shadow-popover">
            <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
              <span className="text-sm font-semibold text-text">Notifications</span>
              {unread > 0 && (
                <button onClick={onMarkAllRead} className="text-xs font-medium text-primary hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-3.5 py-6 text-center text-sm text-textMuted">You're all caught up.</p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      onNotificationClick(n);
                      setOpen(false);
                    }}
                    className="flex w-full items-start gap-2 border-b border-border px-3.5 py-2.5 text-left last:border-0 hover:bg-surfaceHover"
                  >
                    {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                    <div className={n.read ? "pl-3.5" : ""}>
                      <p className="text-sm text-text">{n.message}</p>
                      <p className="mt-0.5 text-xs text-textMuted">{timeAgo(n.createdAt)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={toggleTheme}
        className="hidden rounded-md p-2 text-textMuted hover:bg-surfaceHover hover:text-text sm:block"
        aria-label="Toggle theme"
      >
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <Avatar name={user?.name || ""} initials={user?.avatar} />
    </header>
  );
}
