import React from "react";
import { TaskPriority } from "@/types";
import { getPriorityLabel } from "@/lib/labels";

export type PriorityIndicatorProps = {
  priority: TaskPriority;
  showPrefix?: boolean;
  className?: string;
};

const priorityStyles: Record<TaskPriority, { dot: string; text: string }> = {
  High: {
    dot: "bg-danger",
    text: "text-danger",
  },
  Medium: {
    dot: "bg-warning",
    text: "text-warning",
  },
  Low: {
    dot: "bg-ink-300",
    text: "text-ink-500",
  },
};

export const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({
  priority,
  showPrefix = false,
  className = "",
}) => {
  const style = priorityStyles[priority] ?? priorityStyles.Medium;
  const label = getPriorityLabel(priority);

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-micro font-medium ${style.text} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`}
        aria-hidden="true"
      />
      <span>{showPrefix ? `Prioritas ${label}` : label}</span>
    </span>
  );
};

