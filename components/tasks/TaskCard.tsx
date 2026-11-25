import React from "react";
import Link from "next/link";
import { AlertTriangle, Calendar, Clock } from "lucide-react";
import { computeDaysRemaining } from "@/lib/labels";
import { TaskWithDetails } from "@/types";

export const TaskCard: React.FC<{ task: TaskWithDetails }> = ({ task }) => {
  const days = computeDaysRemaining(task.deadline + "T00:00:00");
  const isOverdue = task.status !== "Done" && days < 0;
  const isDueSoon = task.status !== "Done" && days >= 0 && days <= 3;

  return (
    <div className="p-4">
      <Link
        href={`/tasks/${task.id}`}
        draggable={false}
        className="block pr-10 sm:pr-8 text-sm font-semibold text-slate-900 hover:text-[#0066FF] transition-colors leading-snug line-clamp-2"
      >
        {task.title}
      </Link>

      {(isOverdue || isDueSoon || task.priority === "High") && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {isOverdue ? (
            <span
              title={`Terlambat ${Math.abs(days)} hari (${task.deadline})`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-semibold"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Lewat Deadline</span>
            </span>
          ) : isDueSoon ? (
            <span
              title={`Deadline ${task.deadline} (${days === 0 ? "Hari ini" : `${days} hari lagi`})`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFE600] text-slate-900 text-[11px] font-semibold"
            >
              <Clock className="w-3 h-3" />
              <span>
                {days === 0 ? "Deadline Hari Ini" : `Mendesak (${days}h)`}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF08A] text-amber-900 text-[11px] font-semibold">
              <Clock className="w-3 h-3" />
              <span>Prioritas Tinggi</span>
            </span>
          )}
        </div>
      )}

      {task.totalSubtasks > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                task.status === "Done" ? "bg-emerald-500" : "bg-[#0066FF]"
              }`}
              style={{ width: `${task.progressPercentage ?? 0}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {task.completedSubtasks}/{task.totalSubtasks}
          </span>
        </div>
      )}

      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="px-2 py-0.5 rounded-md bg-[#EEF4FF] text-[#0066FF] text-[11px] font-semibold font-mono">
          {task.course?.courseCode || "MK"}
        </span>
        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-400" />
          {task.deadline}
        </span>
      </div>
    </div>
  );
};
