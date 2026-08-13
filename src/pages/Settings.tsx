import React from "react";
import { Sun, Moon, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Avatar } from "../components/Badges";
import { CompensationRangesSettings } from "../components/CompensationRangesSettings";

export function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) return null;

  return (
    <div className="max-w-xl space-y-5">
      <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <h2 className="text-sm font-semibold text-text">Profile</h2>
        <div className="mt-4 flex items-center gap-3">
          <Avatar name={user.name} initials={user.avatar} size="lg" />
          <div>
            <p className="text-sm font-medium text-text">{user.name}</p>
            <p className="text-xs text-textMuted">{user.email}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-md bg-surfaceHover px-3 py-2 text-xs text-textMuted">
          {user.role === "ADMIN" ? <ShieldCheck size={14} /> : <UserIcon size={14} />}
          {user.role === "ADMIN"
            ? "Admin — can manage all tasks and team members."
            : "Member — can create, update, and complete tasks."}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <h2 className="text-sm font-semibold text-text">Appearance</h2>
        <p className="mt-1 text-sm text-textMuted">Choose how TaskFlow looks on this device.</p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => theme !== "light" && toggleTheme()}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium ${
              theme === "light" ? "border-primary bg-primary/10 text-primary" : "border-border text-textMuted hover:bg-surfaceHover"
            }`}
          >
            <Sun size={15} /> Light
          </button>
          <button
            onClick={() => theme !== "dark" && toggleTheme()}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium ${
              theme === "dark" ? "border-primary bg-primary/10 text-primary" : "border-border text-textMuted hover:bg-surfaceHover"
            }`}
          >
            <Moon size={15} /> Dark
          </button>
        </div>
      </div>

      <CompensationRangesSettings />

      <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <h2 className="text-sm font-semibold text-text">Session</h2>
        <p className="mt-1 text-sm text-textMuted">Sign out of TaskFlow on this device.</p>
        <button
          onClick={logout}
          className="mt-3 flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-danger hover:bg-danger/10"
        >
          <LogOut size={15} /> Log out
        </button>
      </div>
    </div>
  );
}
