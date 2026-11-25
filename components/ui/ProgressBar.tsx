"use client";

import React, { useEffect, useState } from "react";

export type ProgressBarProps = {
  percentage: number | null;
  totalSubtasks?: number;
  completedSubtasks?: number;
  showText?: boolean;
  className?: string;
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  totalSubtasks = 0,
  completedSubtasks = 0,
  showText = true,
  className = "",
}) => {
  const targetWidth =
    percentage === null || totalSubtasks === 0
      ? 0
      : Math.min(100, Math.max(0, percentage));

  const [displayWidth, setDisplayWidth] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setDisplayWidth(targetWidth);
    });
    return () => cancelAnimationFrame(id);
  }, [targetWidth]);

  if (percentage === null || totalSubtasks === 0) {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <div
          className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Belum ada subtugas"
        />
        {showText && (
          <span className="text-micro text-ink-500 block">
            Belum ada subtugas
          </span>
        )}
      </div>
    );
  }

  const isCompleted = percentage === 100;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div
        className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={targetWidth}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progres ${targetWidth}%`}
      >
        <div
          className={`h-full rounded-full transition-[width,background-color] duration-layout ease-editorial ${
            isCompleted ? "bg-emerald-500" : "bg-[#0066FF]"
          }`}
          style={{ width: `${displayWidth}%` }}
        />
      </div>
      {showText && (
        <div className="flex justify-between items-center text-micro text-ink-500 font-mono">
          <span>
            {completedSubtasks}/{totalSubtasks} subtugas
          </span>
          <span className={isCompleted ? "text-success font-medium" : "text-ink-900 font-medium"}>
            {percentage}%
          </span>
        </div>
      )}
    </div>
  );
};
