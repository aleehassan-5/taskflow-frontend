import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useData } from "../context/DataContext";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/calendar": "Calendar",
  "/my-tasks": "My Tasks",
  "/all-tasks": "All Tasks",
  "/team": "Team",
  "/completed": "Completed",
  "/settings": "Settings",
};

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { notifications, markNotificationRead, markAllNotificationsRead, openAddTask } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const title = TITLES[location.pathname] || "TaskFlow";

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
          search={search}
          onSearchChange={setSearch}
          notifications={notifications}
          onNotificationClick={(n) => {
            markNotificationRead(n);
            if (n.taskId) navigate("/all-tasks");
          }}
          onMarkAllRead={markAllNotificationsRead}
          onAddTask={openAddTask}
        />
        <main className="flex-1 px-4 py-5 md:px-6 md:py-6">
          <Outlet context={{ search }} />
        </main>
      </div>
    </div>
  );
}
