export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return `${d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}, ${d.toLocaleTimeString(
    "en-US",
    { hour: "numeric", minute: "2-digit" }
  )}`;
}

export function timeAgo(value: string): string {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}

export function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === "COMPLETED") return false;
  return new Date(dueDate).getTime() < Date.now();
}

export function isDueSoon(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === "COMPLETED") return false;
  const diff = new Date(dueDate).getTime() - Date.now();
  return diff > 0 && diff < 48 * 60 * 60 * 1000;
}

export function formatCompensation(type: "SALARY" | "PERCENTAGE", value: number | null): string {
  if (value == null) return "—";
  if (type === "PERCENTAGE") return `${value}%`;
  return `Rs ${value.toLocaleString("en-PK")}`;
}
