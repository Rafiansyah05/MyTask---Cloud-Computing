import React from "react";
import { TaskStatus } from "@/types";
import { getStatusLabel } from "@/lib/labels";

export type StatusLabelProps = {
  status: TaskStatus;
  className?: string;
};

const statusStyles: Record<TaskStatus, { dot: string; text: string }> = {
  Todo: {
    dot: "bg-ink-500",
    text: "text-ink-700",
  },
  "In Progress": {
    dot: "bg-accent",
    text: "text-ink-900",
  },
  Done: {
    dot: "bg-success",
    text: "text-success",
  },
};

export const StatusLabel: React.FC<StatusLabelProps> = ({
  status,
  className = "",
}) => {
  const style = statusStyles[status] ?? statusStyles.Todo;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-micro font-medium ${style.text} ${className}`}
    >
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`}
        aria-hidden="true"
      />
      <span>{getStatusLabel(status)}</span>
    </span>
  );
};

