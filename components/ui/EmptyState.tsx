"use client";

import React from "react";
import { Button } from "./Button";

export type EmptyStateProps = {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center space-y-4">
      <svg
        width="64"
        height="56"
        viewBox="0 0 64 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto"
        aria-hidden="true"
      >
        <rect
          x="10"
          y="6"
          width="44"
          height="44"
          rx="10"
          fill="#F8FAFC"
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />
        <path
          d="M18 18H46"
          stroke="#E2E8F0"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M18 26H38"
          stroke="#64748B"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M18 34H30"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle
          cx="46"
          cy="38"
          r="9"
          fill="#EEF4FF"
          stroke="#0066FF"
          strokeWidth="1.5"
        />
        <path
          d="M42.5 38H49.5"
          stroke="#0066FF"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      <div className="space-y-1.5 max-w-sm mx-auto">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>

      {actionText && onAction && (
        <div className="pt-1">
          <Button variant="primary" size="md" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
