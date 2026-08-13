import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  ListChecks,
  ClipboardList,
  Users,
  CheckCircle2,
  Briefcase,
  Settings,
  Sun,
  Moon,
  X,
  Layers,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Avatar } from "./Badges";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/my-tasks", label: "My Tasks", icon: ListChecks },
  { to: "/all-tasks", label: "All Tasks", icon: ClipboardList },
  { to: "/team", label: "Team", icon: Users },
  { to: "/completed", label: "Completed", icon: CheckCircle2 },
  { to: "/hiring", label: "Hiring", icon: Briefcase },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primaryText">
              <Layers size={16} />
            </div>
            <span className="font-semibold tracking-tight text-text">TaskFlow</span>
          </div>
          <button className="text-textMuted hover:text-text md:hidden" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-textMuted hover:bg-surfaceHover hover:text-text"
                }`
              }
            >
              <item.icon size={17} strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center justify-between rounded-md px-2 py-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar name={user?.name || ""} initials={user?.avatar} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text">{user?.name}</p>
                <p className="truncate text-xs text-textMuted">{user?.role === "ADMIN" ? "Admin" : "Member"}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="shrink-0 rounded-md p-1.5 text-textMuted hover:bg-surfaceHover hover:text-danger"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
          <button
            onClick={toggleTheme}
            className="mt-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-textMuted hover:bg-surfaceHover hover:text-text"
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            {theme === "light" ? "Dark mode" : "Light mode"}
          </button>
        </div>
      </aside>
    </>
  );
}
