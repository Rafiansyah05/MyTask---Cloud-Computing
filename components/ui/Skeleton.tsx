import React from "react";

export const SkeletonLine: React.FC<{ className?: string }> = ({
  className = "h-4 w-full",
}) => {
  return (
    <div
      aria-hidden="true"
      className={`rounded-control skeleton-shimmer animate-shimmer ${className}`}
    />
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div
      aria-hidden="true"
      className={`rounded-card border border-line bg-surface-raised p-5 space-y-3 ${className}`}
    >
      <SkeletonLine className="h-3 w-24" />
      <SkeletonLine className="h-7 w-16" />
      <SkeletonLine className="h-3 w-36" />
    </div>
  );
};

export const SkeletonRow: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div
      aria-hidden="true"
      className={`rounded-card border border-line bg-surface-raised p-4 flex items-center justify-between gap-4 ${className}`}
    >
      <div className="space-y-2 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <SkeletonLine className="h-3 w-16" />
          <SkeletonLine className="h-3 w-24" />
        </div>
        <SkeletonLine className="h-4 w-3/4" />
      </div>
      <SkeletonLine className="h-4 w-20 shrink-0" />
    </div>
  );
};

