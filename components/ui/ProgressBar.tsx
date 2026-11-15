import React from "react";

type ProgressBarProps = {
  percentage: number | null;
  totalSubtasks?: number;
  completedSubtasks?: number;
  showText?: boolean;
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  totalSubtasks = 0,
  completedSubtasks = 0,
  showText = true,
}) => {
  if (percentage === null || totalSubtasks === 0) {
    return (
      <div className="space-y-1.5">
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden" />
        {showText && (
          <span className="text-[11px] font-medium text-slate-400 italic block">
            Belum ada subtugas
          </span>
        )}
      </div>
    );
  }

  const isCompleted = percentage === 100;

  return (
    <div className="space-y-1.5">
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isCompleted
              ? "bg-gradient-to-r from-emerald-500 to-teal-500"
              : "bg-gradient-to-r from-blue-500 to-indigo-600"
          }`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
      {showText && (
        <div className="flex justify-between items-center text-xs text-slate-600">
          <span className="text-slate-500">
            {completedSubtasks} dari {totalSubtasks} subtugas
          </span>
          <span className={`font-semibold ${isCompleted ? "text-emerald-600" : "text-blue-600"}`}>
            {percentage}%
          </span>
        </div>
      )}
    </div>
  );
};
