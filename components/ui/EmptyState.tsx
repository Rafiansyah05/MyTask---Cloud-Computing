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
    <div className="rounded-card border border-dashed border-ink-300 bg-surface-raised/60 px-6 py-10 text-center space-y-4">
      {/* Custom editorial inline SVG illustration (ink + accent) */}
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
          rx="6"
          fill="#FBF9F4"
          stroke="#B9B3A4"
          strokeWidth="1.5"
        />
        <path
          d="M18 18H46"
          stroke="#E4DFD2"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M18 26H38"
          stroke="#6B665A"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M18 34H30"
          stroke="#B9B3A4"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle
          cx="46"
          cy="38"
          r="9"
          fill="#FDE9E1"
          stroke="#E8481C"
          strokeWidth="1.5"
        />
        <path
          d="M42.5 38H49.5"
          stroke="#E8481C"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      <div className="space-y-1.5 max-w-sm mx-auto">
        <h3 className="font-serif text-title text-ink-900">{title}</h3>
        <p className="text-small text-ink-500 leading-relaxed">{description}</p>
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
