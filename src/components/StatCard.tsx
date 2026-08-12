import React from "react";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: "default" | "primary" | "success" | "warning";
}) {
  const toneClasses: Record<string, string> = {
    default: "bg-surfaceHover text-textMuted",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-textMuted">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-md ${toneClasses[tone]}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-text">{value}</p>
    </div>
  );
}
