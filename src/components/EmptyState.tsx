import React from "react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surfaceHover text-textMuted">
        <Icon size={20} />
      </div>
      <p className="mt-3 text-sm font-medium text-text">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-textMuted">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-border bg-surface p-4">
      <div className="h-3.5 w-2/3 rounded bg-surfaceHover" />
      <div className="mt-3 h-3 w-1/2 rounded bg-surfaceHover" />
      <div className="mt-4 flex gap-2">
        <div className="h-5 w-16 rounded bg-surfaceHover" />
        <div className="h-5 w-16 rounded bg-surfaceHover" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-border">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 w-full rounded bg-surfaceHover" />
        </td>
      ))}
    </tr>
  );
}
