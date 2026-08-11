import type { MetricStatus, Priority } from "../types";

const priorityStyles: Record<Priority, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${priorityStyles[priority]}`}>
      {priority}
    </span>
  );
}

const statusStyles: Record<MetricStatus, { bg: string; label: string }> = {
  "on-track": { bg: "bg-emerald-100 text-emerald-700", label: "On track" },
  "at-risk": { bg: "bg-amber-100 text-amber-700", label: "At risk" },
  "off-track": { bg: "bg-red-100 text-red-700", label: "Off track" },
  done: { bg: "bg-indigo-100 text-indigo-700", label: "Done" },
};

export function StatusBadge({ status }: { status: MetricStatus }) {
  const s = statusStyles[status];
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.bg}`}>{s.label}</span>;
}

export function TagPill({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {name}
    </span>
  );
}
